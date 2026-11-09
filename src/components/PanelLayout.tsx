'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LogOut, Menu, ChevronRight, ChevronDown, Bell, User } from 'lucide-react';
import { navFor, type NavItem } from '@/components/nav-config';
import { getSession, clearSession, homeFor, type Role, type Session } from '@/lib/auth';

interface PanelLayoutProps {
  children: React.ReactNode;
  role: Role;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PanelLayout({ children, role, title, breadcrumbs }: PanelLayoutProps) {
  const rawPath = usePathname();
  const pathname = (rawPath ?? '').replace(/\/$/, '') || '/';
  const router = useRouter();
  const groups = navFor(role);
  const [session, setSessionState] = useState<Session | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);

  // Guard sederhana: harus login & sesuai role.
  // Backend integration point: ganti dengan Supabase Auth + middleware.
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    if (s.role !== role) {
      router.replace(homeFor(s.role));
      return;
    }
    setSessionState(s);
    setAuthorized(true);
  }, [role, router]);

  const isActive = (href?: string) => !!href && pathname === href;
  const hasActiveChild = (item: NavItem) => !!item.children?.some((c) => c.href === pathname);

  // Buka otomatis menu induk yang punya halaman aktif
  useEffect(() => {
    const ids: string[] = [];
    groups.forEach((g) => g.items.forEach((i) => { if (hasActiveChild(i)) ids.push(i.id); }));
    setOpenIds((prev) => Array.from(new Set([...prev, ...ids])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, role]);

  // Tutup drawer otomatis saat pindah halaman (HP)
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggle = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const logout = () => {
    clearSession();
    router.push('/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
        Memeriksa sesi…
      </div>
    );
  }

  const panelName = role === 'owner' ? 'Panel Owner' : 'Panel Admin';
  const displayName = session?.name ?? (role === 'owner' ? 'Owner Linera' : 'Admin Linera');
  const displayEmail = session?.email ?? '';

  const rowStyle = (active: boolean): React.CSSProperties => ({
    color: active ? 'var(--primary)' : 'var(--foreground)',
    backgroundColor: active ? 'var(--muted)' : 'transparent',
  });

  return (
    <div className="panel-root flex h-dvh overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden no-print" style={{ backgroundColor: 'rgba(59,31,10,0.4)' }} onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`no-print fixed lg:relative z-50 lg:z-auto h-full flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-72 max-w-[85vw] ${sidebarOpen ? 'lg:w-64' : 'lg:w-16'}`}
        style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)', boxShadow: '2px 0 8px rgba(181,101,29,0.08)' }}
      >
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', minHeight: '64px' }}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 min-w-0">
              <AppLogo size={32} />
              <div className="min-w-0">
                <span className="font-bold text-sm truncate block" style={{ color: 'var(--primary)' }}>LineraDSS</span>
                <span className="text-xs truncate block" style={{ color: 'var(--muted-foreground)' }}>{panelName}</span>
              </div>
            </div>
          ) : (
            <AppLogo size={32} />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors flex-shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <ChevronRight size={16} className="transition-transform duration-300" style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
          {groups.map((group) => (
            <div key={group.id} className="mb-4">
              {sidebarOpen && (
                <p className="text-xs font-semibold tracking-wider px-3 mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = !!item.children?.length;
                  const childActive = hasActiveChild(item);
                  const expanded = openIds.includes(item.id);
                  const rowCls = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group w-full ${
                    !sidebarOpen ? 'justify-center' : ''
                  }`;

                  if (hasChildren) {
                    const firstHref = item.children![0].href;
                    return (
                      <li key={item.id}>
                        {sidebarOpen ? (
                          <button type="button" onClick={() => toggle(item.id)} className={`${rowCls} sidebar-item-hover`} style={rowStyle(childActive)}>
                            <Icon size={18} className="flex-shrink-0" />
                            <span className="flex-1 truncate text-left">{item.label}</span>
                            <ChevronDown size={14} className="transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                          </button>
                        ) : (
                          <Link href={firstHref} title={item.label} className={`${rowCls} sidebar-item-hover`} style={rowStyle(childActive)}>
                            <Icon size={18} className="flex-shrink-0" />
                          </Link>
                        )}
                        {sidebarOpen && expanded && (
                          <ul className="mt-0.5 ml-5 pl-3 space-y-0.5" style={{ borderLeft: '2px solid var(--border)' }}>
                            {item.children!.map((c) => {
                              const active = isActive(c.href);
                              return (
                                <li key={c.id}>
                                  <Link
                                    href={c.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2 rounded-md text-[13px] font-medium truncate sidebar-item-hover"
                                    style={rowStyle(active)}
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href!}
                        onClick={() => setMobileOpen(false)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`${rowCls} ${active ? 'sidebar-item-active' : 'sidebar-item-hover'}`}
                        style={rowStyle(active)}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--muted)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <User size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{displayEmail}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full ${!sidebarOpen ? 'justify-center' : ''}`}
            style={{ color: 'var(--error)' }}
            title={!sidebarOpen ? 'Keluar' : undefined}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden panel-col">
        <header
          className="no-print flex-shrink-0 flex items-center justify-between px-4 lg:px-6 h-16"
          style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(181,101,29,0.06)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }} onClick={() => { setSidebarOpen(true); setMobileOpen(true); }}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {title && <h1 className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--foreground)' }}>{title}</h1>}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={`crumb-${idx}`}>
                      {idx > 0 && <ChevronRight size={12} />}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:underline">{crumb.label}</Link>
                      ) : (
                        <span style={{ color: 'var(--primary)' }}>{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
              {role === 'owner' ? 'Owner' : 'Admin'}
            </span>
            <button className="relative p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }} title="Notifikasi">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <User size={14} />
            </div>
          </div>
        </header>

        <main className="panel-main flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
