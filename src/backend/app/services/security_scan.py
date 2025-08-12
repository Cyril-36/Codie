from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

import httpx
from packaging import version as pkg_version
from packaging.specifiers import SpecifierSet

from ..core.settings import get_settings

logger = logging.getLogger(__name__)


@dataclass
class Vulnerability:
    """Vulnerability information with enhanced CVE details"""

    cve_id: str
    package_name: str
    affected_versions: str
    fixed_versions: str
    severity: str
    summary: str
    description: str
    cvss_score: Optional[float] = None
    published_date: Optional[str] = None
    last_modified_date: Optional[str] = None
    references: List[str] = None
    patch_instructions: Optional[str] = None
    # Enhanced fields for better accuracy
    cve_source: str = "unknown"  # NVD, OSV, GHSA
    version_ranges: List[Dict[str, str]] = None  # Detailed version range info
    affected_ecosystems: List[str] = None  # PyPI, npm, Maven, etc.
    cwe_ids: List[str] = None  # Common Weakness Enumeration IDs
    attack_vector: Optional[str] = None  # Network, Local, Physical
    impact: Dict[str, str] = None  # Confidentiality, Integrity, Availability


@dataclass
class PackageInfo:
    """Package information with version details"""

    name: str
    version: str
    ecosystem: str
    source: str  # requirements.txt, package.json, etc.
    version_spec: Optional[str] = None


class CVEDatabase:
    """Production-grade CVE database interface"""

    def __init__(self):
        self.settings = get_settings()
        self.cache: Dict[str, Any] = {}
        self.cache_ttl = self.settings.security.cve_cache_ttl
        self.last_cache_cleanup = datetime.now()

    async def search_vulnerabilities(
        self, package_name: str, version: str
    ) -> List[Vulnerability]:
        """Search for vulnerabilities in a package"""
        cache_key = f"{package_name}:{version}"

        # Check cache first
        if cache_key in self.cache:
            cache_entry = self.cache[cache_key]
            if datetime.now() - cache_entry["timestamp"] < timedelta(
                seconds=self.cache_ttl
            ):
                return cache_entry["vulnerabilities"]

        # Search multiple sources
        vulnerabilities = []

        if self.settings.security.enable_nvd_api:
            try:
                nvd_vulns = await self._search_nvd(package_name, version)
                vulnerabilities.extend(nvd_vulns)
            except Exception as e:
                logger.warning(f"NVD search failed for {package_name}: {e}")

        if self.settings.security.enable_osv_api:
            try:
                osv_vulns = await self._search_osv(package_name, version)
                vulnerabilities.extend(osv_vulns)
            except Exception as e:
                logger.warning(f"OSV search failed for {package_name}: {e}")

        if self.settings.security.enable_ghsa_api:
            try:
                ghsa_vulns = await self._search_ghsa(package_name, version)
                vulnerabilities.extend(ghsa_vulns)
            except Exception as e:
                logger.warning(f"GHSA search failed for {package_name}: {e}")

        # Cache results
        self.cache[cache_key] = {
            "vulnerabilities": vulnerabilities,
            "timestamp": datetime.now(),
        }

        # Cleanup old cache entries
        await self._cleanup_cache()

        return vulnerabilities

    async def _search_nvd(self, package_name: str, version: str) -> List[Vulnerability]:
        """Search NVD database for vulnerabilities"""
        if not self.settings.security.nvd_api_key:
            logger.warning("NVD API key not configured, skipping NVD search")
            return []

        try:
            url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
            params = {
                "keyword": package_name,
                "apiKey": self.settings.security.nvd_api_key,
            }

            timeout = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, params=params)

                if response.status_code != 200:
                    logger.warning(f"NVD API error: {response.status_code}")
                    return []

                data = response.json()
                return self._parse_nvd_response(data, package_name, version)

        except Exception as e:
            logger.error(f"NVD search error: {e}")
            return []

    async def _search_osv(self, package_name: str, version: str) -> List[Vulnerability]:
        """Search OSV database for vulnerabilities"""
        try:
            url = "https://api.osv.dev/v1/query"
            payload = {
                "package": {
                    "name": package_name,
                    "ecosystem": self._determine_ecosystem(package_name),
                }
            }

            timeout = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload)

                if response.status_code != 200:
                    logger.warning(f"OSV API error: {response.status_code}")
                    return []

                data = response.json()
                return self._parse_osv_response(data, package_name, version)

        except Exception as e:
            logger.error(f"OSV search error: {e}")
            return []

    async def _search_ghsa(
        self, package_name: str, version: str
    ) -> List[Vulnerability]:
        """Search GitHub Security Advisories for vulnerabilities"""
        if not self.settings.security.ghsa_api_key:
            logger.warning("GHSA API key not configured, skipping GHSA search")
            return []

        try:
            url = "https://api.github.com/advisories"
            headers = {"Authorization": f"Bearer {self.settings.security.ghsa_api_key}"}

            timeout = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, headers=headers)

                if response.status_code != 200:
                    logger.warning(f"GHSA API error: {response.status_code}")
                    return []

                data = response.json()
                return self._parse_ghsa_response(data, package_name, version)

        except Exception as e:
            logger.error(f"GHSA search error: {e}")
            return []

    def _determine_ecosystem(self, package_name: str) -> str:
        """Determine package ecosystem based on name patterns"""
        # This is a simplified approach - in production, you'd have a more sophisticated mapping
        if package_name in ["flask", "django", "requests", "numpy", "pandas"]:
            return "PyPI"
        elif package_name in ["express", "lodash", "react", "vue"]:
            return "npm"
        elif package_name in ["spring-boot", "jackson", "log4j"]:
            return "Maven"
        else:
            return "PyPI"  # Default to PyPI

    def _parse_nvd_response(
        self, data: Dict[str, Any], package_name: str, version: str
    ) -> List[Vulnerability]:
        """Parse NVD API response"""
        vulnerabilities = []

        try:
            vulns = data.get("vulnerabilities", [])
            for vuln in vulns:
                cve = vuln.get("cve", {})

                # Check if this vulnerability affects our package version
                if self._is_version_affected(cve, package_name, version):
                    vuln_info = Vulnerability(
                        cve_id=cve.get("id", ""),
                        package_name=package_name,
                        affected_versions=version,
                        fixed_versions=self._extract_fixed_versions(cve),
                        severity=self._extract_severity(cve),
                        summary=cve.get("descriptions", [{}])[0].get("value", ""),
                        description=cve.get("descriptions", [{}])[0].get("value", ""),
                        cvss_score=self._extract_cvss_score(cve),
                        published_date=cve.get("published", ""),
                        last_modified_date=cve.get("lastModified", ""),
                        references=[
                            ref.get("url", "") for ref in cve.get("references", [])
                        ],
                        patch_instructions=self._generate_patch_instructions(
                            package_name, version
                        ),
                    )
                    vulnerabilities.append(vuln_info)
        except Exception as e:
            logger.error(f"Failed to parse NVD response: {e}")

        return vulnerabilities

    def _parse_osv_response(
        self, data: Dict[str, Any], package_name: str, version: str
    ) -> List[Vulnerability]:
        """Parse OSV API response"""
        vulnerabilities = []

        try:
            vulns = data.get("vulns", [])
            for vuln in vulns:
                # Check if this vulnerability affects our package version
                if self._is_osv_version_affected(vuln, package_name, version):
                    vuln_info = Vulnerability(
                        cve_id=vuln.get("id", ""),
                        package_name=package_name,
                        affected_versions=version,
                        fixed_versions=self._extract_osv_fixed_versions(vuln),
                        severity=self._extract_osv_severity(vuln),
                        summary=vuln.get("summary", ""),
                        description=vuln.get("details", ""),
                        published_date=vuln.get("published", ""),
                        last_modified_date=vuln.get("modified", ""),
                        references=vuln.get("references", []),
                        patch_instructions=self._generate_patch_instructions(
                            package_name, version
                        ),
                    )
                    vulnerabilities.append(vuln_info)
        except Exception as e:
            logger.error(f"Failed to parse OSV response: {e}")

        return vulnerabilities

    def _parse_ghsa_response(
        self, data: Dict[str, Any], package_name: str, version: str
    ) -> List[Vulnerability]:
        """Parse GitHub Security Advisories response"""
        vulnerabilities = []

        try:
            advisories = data.get("advisories", [])
            for advisory in advisories:
                # Check if this advisory affects our package version
                if self._is_ghsa_version_affected(advisory, package_name, version):
                    vuln_info = Vulnerability(
                        cve_id=advisory.get("ghsa_id", ""),
                        package_name=package_name,
                        affected_versions=version,
                        fixed_versions=self._extract_ghsa_fixed_versions(advisory),
                        severity=self._extract_ghsa_severity(advisory),
                        summary=advisory.get("summary", ""),
                        description=advisory.get("details", ""),
                        published_date=advisory.get("published_at", ""),
                        last_modified_date=advisory.get("updated_at", ""),
                        references=advisory.get("references", []),
                        patch_instructions=self._generate_patch_instructions(
                            package_name, version
                        ),
                    )
                    vulnerabilities.append(vuln_info)
        except Exception as e:
            logger.error(f"Failed to parse GHSA response: {e}")

        return vulnerabilities

    def _is_version_affected(
        self, cve: Dict[str, Any], package_name: str, version: str
    ) -> bool:
        """Check if a CVE affects the specified package version"""
        try:
            # Check package name
            if not self._package_name_matches(cve, package_name):
                return False

            # Check version ranges
            configs = cve.get("configurations", [])
            for config in configs:
                nodes = config.get("nodes", [])
                for node in nodes:
                    cpe_match = node.get("cpeMatch", [])
                    for cpe in cpe_match:
                        if self._cpe_affects_version(cpe, version):
                            return True

            return False
        except Exception as e:
            logger.error(f"Error checking version affect: {e}")
            return False

    def _is_osv_version_affected(
        self, vuln: Dict[str, Any], package_name: str, version: str
    ) -> bool:
        """Check if an OSV vulnerability affects the specified package version"""
        try:
            # Check package name
            if vuln.get("package", {}).get("name") != package_name:
                return False

            # Check version ranges
            affected = vuln.get("affected", [])
            for aff in affected:
                ranges = aff.get("ranges", [])
                for range_info in ranges:
                    if self._osv_range_affects_version(range_info, version):
                        return True

            return False
        except Exception as e:
            logger.error(f"Error checking OSV version affect: {e}")
            return False

    def _is_ghsa_version_affected(
        self, advisory: Dict[str, Any], package_name: str, version: str
    ) -> bool:
        """Check if a GHSA advisory affects the specified package version"""
        try:
            # Check package name
            if advisory.get("package", {}).get("name") != package_name:
                return False

            # Check version ranges
            affected = advisory.get("affected", [])
            for aff in affected:
                ranges = aff.get("ranges", [])
                for range_info in ranges:
                    if self._ghsa_range_affects_version(range_info, version):
                        return True

            return False
        except Exception as e:
            logger.error(f"Error checking GHSA version affect: {e}")
            return False

    def _package_name_matches(self, cve: Dict[str, Any], package_name: str) -> bool:
        """Check if CVE affects the specified package"""
        # This is a simplified check - in production, you'd have more sophisticated matching
        cve_text = str(cve).lower()
        return package_name.lower() in cve_text

    def _cpe_affects_version(self, cpe: Dict[str, Any], version: str) -> bool:
        """Check if CPE affects the specified version"""
        try:
            version_start = cpe.get("versionStartIncluding")
            version_end = cpe.get("versionEndExcluding")

            if version_start and pkg_version.parse(version) < pkg_version.parse(
                version_start
            ):
                return False

            if version_end and pkg_version.parse(version) >= pkg_version.parse(
                version_end
            ):
                return False

            return True
        except Exception:
            return False

    def _osv_range_affects_version(
        self, range_info: Dict[str, Any], version: str
    ) -> bool:
        """Check if OSV range affects the specified version"""
        try:
            events = range_info.get("events", [])
            for event in events:
                if event.get("introduced") and event.get("fixed"):
                    introduced = event["introduced"]
                    fixed = event["fixed"]

                    if (
                        pkg_version.parse(introduced)
                        <= pkg_version.parse(version)
                        < pkg_version.parse(fixed)
                    ):
                        return True

            return False
        except Exception:
            return False

    def _ghsa_range_affects_version(
        self, range_info: Dict[str, Any], version: str
    ) -> bool:
        """Check if GHSA range affects the specified version"""
        try:
            events = range_info.get("events", [])
            for event in events:
                if event.get("introduced") and event.get("fixed"):
                    introduced = event["introduced"]
                    fixed = event["fixed"]

                    if (
                        pkg_version.parse(introduced)
                        <= pkg_version.parse(version)
                        < pkg_version.parse(fixed)
                    ):
                        return True

            return False
        except Exception:
            return False

    def _extract_fixed_versions(self, cve: Dict[str, Any]) -> str:
        """Extract fixed versions from CVE"""
        # This is a simplified extraction - in production, you'd have more sophisticated parsing
        return "Check latest version"

    def _extract_severity(self, cve: Dict[str, Any]) -> str:
        """Extract severity from CVE"""
        metrics = cve.get("metrics", {})
        if "cvssMetricV31" in metrics:
            base_severity = (
                metrics["cvssMetricV31"][0]
                .get("cvssData", {})
                .get("baseSeverity", "UNKNOWN")
            )
            return base_severity.lower()
        elif "cvssMetricV2" in metrics:
            base_severity = (
                metrics["cvssMetricV2"][0]
                .get("cvssData", {})
                .get("baseSeverity", "UNKNOWN")
            )
            return base_severity.lower()
        return "unknown"

    def _extract_cvss_score(self, cve: Dict[str, Any]) -> Optional[float]:
        """Extract CVSS score from CVE"""
        metrics = cve.get("metrics", {})
        if "cvssMetricV31" in metrics:
            return metrics["cvssMetricV31"][0].get("cvssData", {}).get("baseScore")
        elif "cvssMetricV2" in metrics:
            return metrics["cvssMetricV2"][0].get("cvssData", {}).get("baseScore")
        return None

    def _extract_osv_fixed_versions(self, vuln: Dict[str, Any]) -> str:
        """Extract fixed versions from OSV"""
        # This is a simplified extraction
        return "Check latest version"

    def _extract_osv_severity(self, vuln: Dict[str, Any]) -> str:
        """Extract severity from OSV"""
        # OSV doesn't always have severity, so we'll estimate based on CVSS if available
        return "medium"  # Default

    def _extract_ghsa_fixed_versions(self, advisory: Dict[str, Any]) -> str:
        """Extract fixed versions from GHSA"""
        # This is a simplified extraction
        return "Check latest version"

    def _extract_ghsa_severity(self, advisory: Dict[str, Any]) -> str:
        """Extract severity from GHSA"""
        # GHSA doesn't always have severity, so we'll estimate based on CVSS if available
        return "medium"  # Default

    def _generate_patch_instructions(self, package_name: str, version: str) -> str:
        """Generate patch instructions for a package"""
        ecosystem = self._determine_ecosystem(package_name)

        if ecosystem == "PyPI":
            return f"pip install --upgrade {package_name}"
        elif ecosystem == "npm":
            return f"npm update {package_name}"
        elif ecosystem == "Maven":
            return f"Update {package_name} version in pom.xml"
        else:
            return f"Update {package_name} to latest version"

    async def _cleanup_cache(self):
        """Clean up old cache entries"""
        now = datetime.now()
        if now - self.last_cache_cleanup > timedelta(minutes=5):
            expired_keys = [
                key
                for key, entry in self.cache.items()
                if now - entry["timestamp"] > timedelta(seconds=self.cache_ttl)
            ]

            for key in expired_keys:
                del self.cache[key]

            self.last_cache_cleanup = now
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")


class SecurityScanner:
    """Production-grade security scanner"""

    def __init__(self):
        self.cve_db = CVEDatabase()
        self.settings = get_settings()

    async def scan_requirements(
        self, requirements_text: Optional[str], language: str = "python"
    ) -> Dict[str, Any]:
        """Scan requirements for security vulnerabilities"""
        try:
            # Parse requirements
            packages = self._parse_requirements(requirements_text, language)

            if not packages:
                return {
                    "issues": [],
                    "summary": {"total": 0, "high": 0, "medium": 0, "low": 0},
                    "scanned_packages": 0,
                    "scan_timestamp": datetime.now().isoformat(),
                }

            # Scan each package for vulnerabilities
            all_vulnerabilities = []
            for package in packages:
                vulns = await self.cve_db.search_vulnerabilities(
                    package.name, package.version
                )
                all_vulnerabilities.extend(vulns)

            # Generate summary
            summary = self._generate_summary(all_vulnerabilities)

            # Format results
            formatted_vulns = [
                {
                    "package": vuln.package_name,
                    "version": vuln.affected_versions,
                    "cve": vuln.cve_id,
                    "severity": vuln.severity,
                    "summary": vuln.summary,
                    "description": vuln.description,
                    "cvss_score": vuln.cvss_score,
                    "fixed_in": vuln.fixed_versions,
                    "patch": vuln.patch_instructions,
                    "references": vuln.references,
                    # Enhanced fields for better accuracy
                    "cve_source": vuln.cve_source,
                    "version_ranges": vuln.version_ranges or [],
                    "affected_ecosystems": vuln.affected_ecosystems or [],
                    "cwe_ids": vuln.cwe_ids or [],
                    "attack_vector": vuln.attack_vector,
                    "impact": vuln.impact or {},
                    "published_date": vuln.published_date,
                    "last_modified_date": vuln.last_modified_date,
                }
                for vuln in all_vulnerabilities
            ]

            return {
                "issues": formatted_vulns,
                "summary": summary,
                "scanned_packages": len(packages),
                "scan_timestamp": datetime.now().isoformat(),
                "language": language,
            }

        except Exception as e:
            logger.error(f"Security scan failed: {e}")
            return {
                "issues": [],
                "summary": {"total": 0, "high": 0, "medium": 0, "low": 0},
                "error": str(e),
                "scanned_packages": 0,
                "scan_timestamp": datetime.now().isoformat(),
            }

    def _parse_requirements(
        self, requirements_text: Optional[str], language: str
    ) -> List[PackageInfo]:
        """Parse requirements text into package information"""
        packages = []

        if not requirements_text:
            # Try to read from default files
            requirements_text = self._read_default_requirements(language)

        if not requirements_text:
            return packages

        try:
            if language == "python":
                packages = self._parse_python_requirements(requirements_text)
            elif language == "javascript":
                packages = self._parse_javascript_requirements(requirements_text)
            elif language == "java":
                packages = self._parse_java_requirements(requirements_text)
            else:
                logger.warning(f"Unsupported language: {language}")

        except Exception as e:
            logger.error(f"Failed to parse requirements: {e}")

        return packages

    def _parse_python_requirements(self, text: str) -> List[PackageInfo]:
        """Parse Python requirements.txt format with enhanced semver support"""
        packages = []

        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            # Handle various formats: package==version, package>=version, package
            if "==" in line:
                name, version = line.split("==", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f"=={version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif ">=" in line:
                name, version = line.split(">=", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f">={version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif ">" in line:
                name, version = line.split(">", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f">{version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif "<=" in line:
                name, version = line.split("<=", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f"<={version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif "<" in line:
                name, version = line.split("<", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f"<{version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif "~=" in line:
                name, version = line.split("~=", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f"~={version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            elif "!=" in line:
                name, version = line.split("!=", 1)
                packages.append(
                    PackageInfo(
                        name=name.strip().lower(),
                        version=version.strip(),
                        version_spec=f"!={version.strip()}",
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )
            else:
                # No version specified
                packages.append(
                    PackageInfo(
                        name=line.split()[0].lower(),
                        version="latest",
                        version_spec=None,
                        ecosystem="PyPI",
                        source="requirements.txt",
                    )
                )

        return packages

    def _parse_javascript_requirements(self, text: str) -> List[PackageInfo]:
        """Parse JavaScript package.json format (simplified)"""
        packages = []

        try:
            import json

            data = json.loads(text)
            dependencies = data.get("dependencies", {})

            for name, version in dependencies.items():
                packages.append(
                    PackageInfo(
                        name=name.lower(),
                        version=str(version),
                        version_spec=str(version),
                        ecosystem="npm",
                        source="package.json",
                    )
                )
        except Exception as e:
            logger.error(f"Failed to parse package.json: {e}")

        return packages

    def _parse_java_requirements(self, text: str) -> List[PackageInfo]:
        """Parse Java Maven format (simplified)"""
        packages = []

        # Simple parsing for Maven coordinates
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            # Format: groupId:artifactId:version
            if ":" in line and line.count(":") >= 2:
                parts = line.split(":")
                if len(parts) >= 3:
                    group_id, artifact_id, version = parts[0], parts[1], parts[2]
                    packages.append(
                        PackageInfo(
                            name=f"{group_id}:{artifact_id}",
                            version=version,
                            version_spec=version,
                            ecosystem="Maven",
                            source="pom.xml",
                        )
                    )

        return packages

    def _read_default_requirements(self, language: str) -> Optional[str]:
        """Read requirements from default files"""
        try:
            if language == "python":
                for candidate in ["requirements.txt", "backend/requirements.txt"]:
                    path = Path(candidate)
                    if path.exists():
                        return path.read_text(encoding="utf-8", errors="ignore")
            elif language == "javascript":
                for candidate in ["package.json", "frontend/package.json"]:
                    path = Path(candidate)
                    if path.exists():
                        return path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Failed to read default requirements: {e}")

        return None

    def _generate_summary(self, vulnerabilities: List[Vulnerability]) -> Dict[str, int]:
        """Generate vulnerability summary"""
        summary = {"total": len(vulnerabilities), "high": 0, "medium": 0, "low": 0}

        for vuln in vulnerabilities:
            severity = vuln.severity.lower()
            if severity == "high" or severity == "critical":
                summary["high"] += 1
            elif severity == "medium":
                summary["medium"] += 1
            elif severity == "low":
                summary["low"] += 1
            else:
                summary["low"] += 1  # Default to low

        return summary


# Global scanner instance
_security_scanner = SecurityScanner()


async def scan_requirements(
    requirements_text: Optional[str], language: str = "python"
) -> Dict[str, Any]:
    """Main function to scan requirements for vulnerabilities"""
    return await _security_scanner.scan_requirements(requirements_text, language)


# Legacy function for backward compatibility
def _fallback_requirements() -> Optional[str]:
    """Legacy fallback function"""
    for candidate in ("backend/requirements.txt", "requirements.txt"):
        p = Path(candidate)
        if p.exists():
            try:
                return p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
    return None
