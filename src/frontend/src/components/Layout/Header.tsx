import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  List,
  Sun,
  Moon,
  User,
  SignOut,
  CaretDown
} from "phosphor-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useStickyHeader } from "../../hooks/useStickyHeader";
import { useTheme } from "../../styles/theme";
import Button from "../ui/Button";

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
}: { onToggleSidebar?: () => void; isSidebarOpen?: boolean }) {
  const { mode: _mode, toggle, isDark, isLight: _isLight } = useTheme();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Use sticky header hook
  useStickyHeader({ selector: '.header' });

  return (
    <motion.header
      className="
        header
        fixed top-0 left-0 right-0 z-50
        h-header md:h-header-mobile
        glass-card backdrop-blur-xl
        border-b border-border-default
        px-6 md:px-12
        flex items-center justify-between
        shadow-lg
        page-enter
      "
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button with enhanced motion */}
        <motion.button
          type="button"
          aria-label="Toggle navigation menu"
          aria-controls="sidebar-panel"
          aria-expanded={isSidebarOpen}
          className="
            md:hidden p-2 rounded-lg
            text-text-secondary hover:text-text-primary
            hover:bg-bg-hover
            focus:outline-none focus:ring-2 focus:ring-border-focus
            transition-all duration-300
            btn-anim
          "
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <List size={20} weight="bold" />
        </motion.button>

        {/* Logo with enhanced motion */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <motion.div
            className="
              w-7 h-7 text-brand-primary
              group-hover:text-brand-secondary
              transition-all duration-300
              hover-scale
            "
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <House size={28} weight="bold" />
          </motion.div>
          <motion.span
            className="
              text-2xl font-bold
              text-text-primary
              group-hover:text-brand-primary
              transition-all duration-300
              hover-scale
            "
            whileHover={{ scale: 1.02 }}
          >
            Codie
          </motion.span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle with enhanced motion */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="
              p-2 rounded-lg
              text-text-secondary hover:text-text-primary
              hover:bg-bg-hover
              transition-all duration-300
            "
            leftIcon={
              isDark ? (
                <Sun size={20} weight="bold" />
              ) : (
                <Moon size={20} weight="bold" />
              )
            }
          />
        </motion.div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            type="button"
            className="
              flex items-center gap-2 p-2 rounded-lg
              text-text-secondary hover:text-text-primary
              hover:bg-bg-hover
              focus:outline-none focus:ring-2 focus:ring-border-focus
              transition-all duration-300
              btn-anim
            "
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <User size={20} weight="bold" />
            <span className="hidden md:block text-sm font-medium">
              {user?.name || "User"}
            </span>
            <motion.div
              animate={{ rotate: userMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <CaretDown size={16} weight="bold" />
            </motion.div>
          </motion.button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className="
                  absolute right-0 top-full mt-2 w-48
                  bg-bg-tertiary border border-border-default
                  rounded-lg shadow-lg backdrop-blur-md
                  z-50
                "
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-text-secondary border-b border-border-default">
                    Signed in as <span className="font-medium text-text-primary">{user?.email}</span>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={logout}
                      className="
                        w-full flex items-center gap-2 px-3 py-2 text-sm
                        text-text-secondary hover:text-error
                        hover:bg-bg-hover rounded-md
                        transition-all duration-200
                      "
                    >
                      <SignOut size={16} weight="bold" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
