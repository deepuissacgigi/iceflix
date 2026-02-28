import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

const STORAGE_KEY = 'ott_notifications';
const MAX_NOTIFICATIONS = 50;

export const NotificationProvider = ({ children }) => {
    // 1. Initialize synchronously to prevent the wipe-on-mount bug
    const [notifications, setNotifications] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [unreadCount, setUnreadCount] = useState(() => {
        return notifications.filter(n => !n.read).length;
    });

    // Save to local storage whenever notifications change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    /**
     * Add a rich notification.
     * @param {string} message - Main text
     * @param {string} type - 'play' | 'add' | 'remove' | 'success' | 'info' | 'signup'
     * @param {object} meta - Optional { thumbnail, title, subtitle }
     */
    const addNotification = useCallback((message, type = 'info', meta = {}) => {
        setNotifications(prev => {
            const newNotif = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                message,
                type,
                read: false,
                timestamp: Date.now(),
                thumbnail: meta.thumbnail || null,
                title: meta.title || null,
                subtitle: meta.subtitle || null,
            };
            const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
            return updated;
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAllAsRead,
            clearAll,
            removeNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
