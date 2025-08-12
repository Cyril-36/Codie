import { motion, useReducedMotion as framerUseReducedMotion } from 'framer-motion';
import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'underline' | 'slide' | 'indicator';
  className?: string;
  'aria-label'?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  variant = 'underline',
  className = '',
  'aria-label': ariaLabel = 'Tabs'
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });
  const prefersReducedMotion = framerUseReducedMotion();

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  }, [onTabChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault();
        let prevIndex = currentIndex - 1;
        while (prevIndex !== currentIndex) {
          if (prevIndex < 0) prevIndex = tabs.length - 1;
          if (!tabs[prevIndex].disabled) {
            handleTabChange(tabs[prevIndex].id);
            tabRefs.current[prevIndex]?.focus();
            break;
          }
          prevIndex--;
        }
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        let nextIndex = currentIndex + 1;
        while (nextIndex !== currentIndex) {
          if (nextIndex >= tabs.length) nextIndex = 0;
          if (!tabs[nextIndex].disabled) {
            handleTabChange(tabs[nextIndex].id);
            tabRefs.current[nextIndex]?.focus();
            break;
          }
          nextIndex++;
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!tabs[currentIndex].disabled) {
          handleTabChange(tabs[currentIndex].id);
        }
        break;
      }
    }
  }, [tabs, handleTabChange]);

  // Update tab indicator position
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
      const activeTabElement = tabRefs.current[activeIndex];
      if (activeTabElement) {
        const rect = activeTabElement.getBoundingClientRect();
        const containerRect = activeTabElement.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setTabIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width
          });
        }
      }
    }
  }, [activeTab, tabs]);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`tabs-container ${className}`}>
      {/* Tab List */}
      <div 
        className="tab-list"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`
              tab-button tab-underline tab-${variant}
              ${activeTab === tab.id ? 'active' : ''}
              ${tab.disabled ? 'disabled' : ''}
            `}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
        
        {/* Moving indicator for premium feel */}
        {variant === 'underline' && (
          <motion.div
            className="tab-indicator-line"
            style={{
              position: 'absolute',
              bottom: 0,
              height: '2px',
              background: 'var(--primary)',
              borderRadius: '1px'
            }}
            animate={prefersReducedMotion ? {
              left: tabIndicatorStyle.left,
              width: tabIndicatorStyle.width
            } : {
              left: tabIndicatorStyle.left,
              width: tabIndicatorStyle.width
            }}
            transition={prefersReducedMotion ? undefined : {
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
          />
        )}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tab-panel"
      >
        <motion.div
          key={activeTab}
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
        >
          {activeTabData?.content}
        </motion.div>
      </div>
    </div>
  );
};

export default Tabs;
