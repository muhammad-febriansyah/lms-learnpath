import {
    Award,
    BadgeCheck,
    Banknote,
    BarChart3,
    BookCopy,
    BookOpen,
    Bot,
    Briefcase,
    Building2,
    ClipboardCheck,
    ClipboardList,
    Coins,
    Compass,
    CreditCard,
    Crown,
    FolderOpen,
    Gauge,
    GitBranch,
    GraduationCap,
    HelpCircle,
    Info,
    LayoutDashboard,
    Mail,
    MessageSquare,
    NotebookPen,
    Package,
    Palette,
    Receipt,
    Settings,
    Shield,
    ShieldCheck,
    Sparkles,
    Star,
    Tag,
    Target,
    Ticket,
    TrendingDown,
    TrendingUp,
    Trophy,
    Users,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { dashboard as appDashboard } from '@/routes';
import admin from '@/routes/admin';
import bundles from '@/routes/bundles';
import business from '@/routes/business';
import courses from '@/routes/courses';
import messages from '@/routes/messages';
import myAchievements from '@/routes/my-achievements';
import myCertificates from '@/routes/my-certificates';
import myCourses from '@/routes/my-courses';
import myNotes from '@/routes/my-notes';
import myPaths from '@/routes/my-paths';
import myRecommendations from '@/routes/my-recommendations';
import mySkillMatrix from '@/routes/my-skill-matrix';
import myTutor from '@/routes/my-tutor';
import orders from '@/routes/orders';

export type AdminNavItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
    permission?: string;
    roles?: string[];
    badge?: string;
};

export type AdminNavGroup = {
    label: string;
    icon: LucideIcon;
    permission?: string;
    roles?: string[];
    items: AdminNavItem[];
};

export type AdminNavRoot = {
    type: 'item';
    title: string;
    href: string;
    icon: LucideIcon;
    permission?: string;
    roles?: string[];
    badge?: string;
};

export type AdminNavDivider = {
    type: 'divider';
    label: string;
    roles?: string[];
};

export type AdminNavSection =
    | AdminNavRoot
    | (AdminNavGroup & { type: 'group' })
    | AdminNavDivider;

export const ADMIN_NAV: AdminNavSection[] = [
    {
        type: 'item',
        title: 'Dashboard',
        href: admin.dashboard().url,
        icon: LayoutDashboard,
    },

    { type: 'divider', label: 'Akademik' },
    {
        type: 'group',
        label: 'Konten Course',
        icon: BookOpen,
        items: [
            { title: 'Course', href: admin.courses.index().url, icon: BookCopy, permission: 'course.view' },
            { title: 'Kategori', href: admin.categories.index().url, icon: FolderOpen, permission: 'category.manage' },
            { title: 'Tag', href: admin.tags.index().url, icon: Tag, permission: 'tag.manage' },
            { title: 'Paket Kursus', href: admin.bundles.index().url, icon: Package, permission: 'bundle.manage' },
            { title: 'Learning Path', href: admin.learningPaths.index().url, icon: Compass, permission: 'learning_path.manage' },
        ],
    },

    { type: 'divider', label: 'Operasional' },
    {
        type: 'group',
        label: 'Pembelajaran',
        icon: ClipboardList,
        items: [
            { title: 'Enrollment', href: admin.enrollments.index().url, icon: ClipboardList, permission: 'enrollment.view' },
            { title: 'Assessment', href: admin.assessments.index().url, icon: ClipboardCheck, permission: 'assessment.manage' },
            { title: 'Sertifikat', href: admin.certificates.index().url, icon: Award, permission: 'certificate.view' },
        ],
    },

    { type: 'divider', label: 'B2B', roles: ['admin_tenant'] },
    {
        type: 'group',
        label: 'Tenant',
        icon: Building2,
        roles: ['admin_tenant'],
        items: [
            { title: 'Dashboard B2B', href: business.dashboard().url, icon: Gauge },
            { title: 'Karyawan', href: business.members.index().url, icon: Users },
            { title: 'Undangan', href: business.invitations.index().url, icon: Mail },
            { title: 'Branding Tenant', href: admin.tenantBranding.show().url, icon: Palette },
        ],
    },

    { type: 'divider', label: 'Kompetensi' },
    {
        type: 'group',
        label: 'Skill Matrix',
        icon: Target,
        permission: 'skill_matrix.view',
        items: [
            { title: 'Dashboard', href: admin.skillMatrix.index().url, icon: Gauge, permission: 'skill_matrix.view' },
            { title: 'Divisi', href: admin.divisions.index().url, icon: Building2, permission: 'division.manage' },
            { title: 'Posisi / Jabatan', href: admin.positions.index().url, icon: Briefcase, permission: 'position.manage' },
            { title: 'Kompetensi', href: admin.competencies.index().url, icon: BadgeCheck, permission: 'competency.manage' },
            { title: 'Target Kompetensi', href: admin.positionCompetencyTargets.index().url, icon: Target, permission: 'skill_matrix.manage' },
            { title: 'Mapping Course', href: admin.courseCompetencyMappings.index().url, icon: GitBranch, permission: 'skill_matrix.manage' },
        ],
    },
    {
        type: 'group',
        label: 'Pengembangan',
        icon: Sparkles,
        permission: 'skill_matrix.view',
        items: [
            { title: 'OJT Assessment', href: admin.ojtAssessments.index().url, icon: ClipboardCheck, permission: 'ojt.review' },
            { title: 'Supervisor Review', href: admin.supervisorReviews.index().url, icon: ShieldCheck, permission: 'supervisor_review.approve' },
            { title: 'Skill Gap', href: admin.skillGaps.index().url, icon: TrendingDown, permission: 'skill_matrix.view' },
            { title: 'Rekomendasi Training', href: admin.trainingRecommendations.index().url, icon: Sparkles, permission: 'skill_matrix.view' },
        ],
    },

    { type: 'divider', label: 'Analitik' },
    {
        type: 'group',
        label: 'Laporan',
        icon: BarChart3,
        permission: 'report.view',
        items: [
            { title: 'Course Progress', href: admin.reports.courseProgress().url, icon: TrendingDown, permission: 'report.view' },
            { title: 'Assessment', href: admin.reports.assessment().url, icon: ClipboardCheck, permission: 'report.view' },
            { title: 'Sertifikat', href: admin.reports.certificate().url, icon: Award, permission: 'report.view' },
            { title: 'Skill Gap', href: admin.reports.skillGap().url, icon: Target, permission: 'report.view' },
            { title: 'Sales & Revenue', href: admin.reports.sales().url, icon: Banknote, permission: 'report.view' },
        ],
    },

    { type: 'divider', label: 'Platform' },
    {
        type: 'group',
        label: 'Pengguna',
        icon: Users,
        items: [
            { title: 'Users', href: admin.users.index().url, icon: Users, permission: 'user.view' },
            { title: 'Instructor', href: admin.instructors.index().url, icon: GraduationCap, permission: 'user.view' },
            { title: 'Roles & Permissions', href: admin.roles.index().url, icon: ShieldCheck, permission: 'role.manage' },
        ],
    },
    {
        type: 'group',
        label: 'Marketplace',
        icon: Wallet,
        items: [
            { title: 'Order', href: admin.orders.index().url, icon: Receipt, permission: 'order.view' },
            { title: 'Payment', href: admin.payments.index().url, icon: CreditCard, permission: 'payment.view' },
            { title: 'Penarikan', href: '/admin/payouts', icon: Wallet, permission: 'payment.view' },
            { title: 'Voucher Diskon', href: admin.coupons.index().url, icon: Ticket, permission: 'coupon.manage' },
            { title: 'Voucher Akses', href: '/admin/vouchers', icon: Tag, permission: 'voucher.manage' },
            { title: 'Tukar Poin', href: '/admin/point-redemptions', icon: Coins, permission: 'point_redemption.manage' },
            { title: 'Paket B2B', href: '/admin/subscription-plans', icon: Package, permission: 'subscription.manage' },
            { title: 'Lead Sales B2B', href: '/admin/subscription-leads', icon: Mail, permission: 'subscription.manage' },
            { title: 'Paket Langganan B2C', href: '/admin/b2c-plans', icon: Crown, permission: 'subscription.manage' },
            { title: 'Pelanggan B2C', href: '/admin/b2c-subscriptions', icon: Users, permission: 'subscription.manage' },
            { title: 'E-Wallet Korporat', href: '/admin/organization-wallets', icon: Wallet, permission: 'payment.view' },
            { title: 'Review', href: admin.reviews.index().url, icon: Star, permission: 'review.moderate' },
        ],
    },
    {
        type: 'item',
        title: 'FAQ',
        href: '/admin/faqs',
        icon: HelpCircle,
        permission: 'faq.manage',
    },
    {
        type: 'item',
        title: 'Tentang Kami',
        href: '/admin/about',
        icon: Info,
        permission: 'about.manage',
    },
    {
        type: 'item',
        title: 'Audit Log',
        href: '/admin/audit-log',
        icon: Shield,
        permission: 'audit.view',
    },
    {
        type: 'item',
        title: 'Settings',
        href: admin.settings.index().url,
        icon: Settings,
        permission: 'settings.view',
    },
];

/**
 * Superadmin = platform owner (lihat semua tenant). Sidebar flat tanpa
 * group/dropdown — pakai divider sebagai pemisah seksi. Item dipilih agar
 * fokus pada governance platform (tenant, marketplace, audit, system).
 */
export const SUPERADMIN_NAV: AdminNavSection[] = [
    { type: 'item', title: 'Dashboard', href: admin.dashboard().url, icon: LayoutDashboard },

    { type: 'divider', label: 'Platform' },
    { type: 'item', title: 'Tenant', href: '/admin/tenants', icon: Building2 },
    { type: 'item', title: 'Paket B2B', href: '/admin/subscription-plans', icon: Package },
    { type: 'item', title: 'Paket Langganan B2C', href: '/admin/b2c-plans', icon: Crown },
    { type: 'item', title: 'Lead Sales B2B', href: '/admin/subscription-leads', icon: Mail },

    { type: 'divider', label: 'Konten' },
    { type: 'item', title: 'Course', href: admin.courses.index().url, icon: BookCopy, permission: 'course.view' },
    { type: 'item', title: 'Kategori', href: admin.categories.index().url, icon: FolderOpen, permission: 'category.manage' },
    { type: 'item', title: 'Tag', href: admin.tags.index().url, icon: Tag, permission: 'tag.manage' },
    { type: 'item', title: 'Paket Kursus', href: admin.bundles.index().url, icon: Package, permission: 'bundle.manage' },
    { type: 'item', title: 'Learning Path', href: admin.learningPaths.index().url, icon: Compass, permission: 'learning_path.manage' },

    { type: 'divider', label: 'Operasional' },
    { type: 'item', title: 'Enrollment', href: admin.enrollments.index().url, icon: ClipboardList, permission: 'enrollment.view' },
    { type: 'item', title: 'Assessment', href: admin.assessments.index().url, icon: ClipboardCheck, permission: 'assessment.manage' },
    { type: 'item', title: 'Sertifikat', href: admin.certificates.index().url, icon: Award, permission: 'certificate.view' },
    { type: 'item', title: 'Review', href: admin.reviews.index().url, icon: Star, permission: 'review.moderate' },

    { type: 'divider', label: 'Marketplace' },
    { type: 'item', title: 'Order', href: admin.orders.index().url, icon: Receipt, permission: 'order.view' },
    { type: 'item', title: 'Payment', href: admin.payments.index().url, icon: CreditCard, permission: 'payment.view' },
    { type: 'item', title: 'Penarikan', href: '/admin/payouts', icon: Wallet, permission: 'payment.view' },
    { type: 'item', title: 'Voucher Diskon', href: admin.coupons.index().url, icon: Ticket, permission: 'coupon.manage' },
    { type: 'item', title: 'Voucher Akses', href: '/admin/vouchers', icon: Tag, permission: 'voucher.manage' },
    { type: 'item', title: 'Poin Pengguna', href: '/admin/user-points', icon: Coins },
    { type: 'item', title: 'Tukar Poin', href: '/admin/point-redemptions', icon: Coins, permission: 'point_redemption.manage' },
    { type: 'item', title: 'Pelanggan B2C', href: '/admin/b2c-subscriptions', icon: Users, permission: 'subscription.manage' },
    { type: 'item', title: 'E-Wallet Korporat', href: '/admin/organization-wallets', icon: Wallet, permission: 'payment.view' },

    { type: 'divider', label: 'Pengguna' },
    { type: 'item', title: 'Users', href: admin.users.index().url, icon: Users, permission: 'user.view' },
    { type: 'item', title: 'Instructor', href: admin.instructors.index().url, icon: GraduationCap, permission: 'user.view' },
    { type: 'item', title: 'Roles & Permissions', href: admin.roles.index().url, icon: ShieldCheck, permission: 'role.manage' },

    { type: 'divider', label: 'Kompetensi' },
    { type: 'item', title: 'Skill Matrix', href: admin.skillMatrix.index().url, icon: Target, permission: 'skill_matrix.view' },
    { type: 'item', title: 'Divisi', href: admin.divisions.index().url, icon: Building2, permission: 'division.manage' },
    { type: 'item', title: 'Posisi / Jabatan', href: admin.positions.index().url, icon: Briefcase, permission: 'position.manage' },
    { type: 'item', title: 'Kompetensi', href: admin.competencies.index().url, icon: BadgeCheck, permission: 'competency.manage' },
    { type: 'item', title: 'Target Kompetensi', href: admin.positionCompetencyTargets.index().url, icon: Target, permission: 'skill_matrix.manage' },
    { type: 'item', title: 'Mapping Course', href: admin.courseCompetencyMappings.index().url, icon: GitBranch, permission: 'skill_matrix.manage' },
    { type: 'item', title: 'Skill Gap', href: admin.skillGaps.index().url, icon: TrendingDown, permission: 'skill_matrix.view' },
    { type: 'item', title: 'Rekomendasi Training', href: admin.trainingRecommendations.index().url, icon: Sparkles, permission: 'skill_matrix.view' },

    { type: 'divider', label: 'Analitik' },
    { type: 'item', title: 'Course Progress', href: admin.reports.courseProgress().url, icon: TrendingDown, permission: 'report.view' },
    { type: 'item', title: 'Assessment', href: admin.reports.assessment().url, icon: ClipboardCheck, permission: 'report.view' },
    { type: 'item', title: 'Sertifikat', href: admin.reports.certificate().url, icon: Award, permission: 'report.view' },
    { type: 'item', title: 'Sales & Revenue', href: admin.reports.sales().url, icon: Banknote, permission: 'report.view' },

    { type: 'divider', label: 'Trust & Safety' },
    { type: 'item', title: 'Audit Log', href: '/admin/audit-log', icon: Shield, permission: 'audit.view' },
    { type: 'item', title: 'Login Sessions', href: '/admin/sessions', icon: ShieldCheck, permission: 'audit.view' },
    { type: 'item', title: 'Content Moderation', href: '/admin/moderation', icon: Shield, permission: 'review.moderate' },

    { type: 'divider', label: 'Sistem' },
    { type: 'item', title: 'FAQ', href: '/admin/faqs', icon: HelpCircle, permission: 'faq.manage' },
    { type: 'item', title: 'Tentang Kami', href: '/admin/about', icon: Info, permission: 'about.manage' },
    { type: 'item', title: 'Settings', href: admin.settings.index().url, icon: Settings, permission: 'settings.view' },
];

export const HR_NAV: AdminNavSection[] = [
    { type: 'divider', label: 'Menu Utama' },
    { type: 'item', title: 'Dashboard', href: admin.dashboard().url, icon: LayoutDashboard },
    { type: 'item', title: 'Karyawan', href: business.members.index().url, icon: Users },
    { type: 'item', title: 'Undangan', href: business.invitations.index().url, icon: Mail },
    { type: 'item', title: 'Branding Tenant', href: admin.tenantBranding.show().url, icon: Palette },

    { type: 'divider', label: 'Struktur Organisasi' },
    { type: 'item', title: 'Divisi', href: admin.divisions.index().url, icon: Building2 },
    { type: 'item', title: 'Posisi & Jabatan', href: admin.positions.index().url, icon: Briefcase },
    { type: 'item', title: 'Kompetensi', href: admin.competencies.index().url, icon: BadgeCheck },
    { type: 'item', title: 'Skill Matrix', href: admin.skillMatrix.index().url, icon: Target },

    { type: 'divider', label: 'Pengembangan Karyawan' },
    { type: 'item', title: 'Skill Gap', href: admin.skillGaps.index().url, icon: TrendingDown },
    { type: 'item', title: 'Rekomendasi Training', href: admin.trainingRecommendations.index().url, icon: Sparkles },
    { type: 'item', title: 'Penugasan Training', href: admin.enrollments.index().url, icon: ClipboardList },

    { type: 'divider', label: 'Laporan' },
    { type: 'item', title: 'Laporan', href: admin.reports.courseProgress().url, icon: BarChart3 },

    { type: 'divider', label: 'Tagihan & Seat' },
    { type: 'item', title: 'E-Wallet Korporat', href: '/business/wallet', icon: Wallet },
    { type: 'item', title: 'Tagihan & Invoice', href: '/business/billing', icon: Receipt },
    { type: 'item', title: 'Utilisasi Seat', href: '/business/seats', icon: CreditCard },
];

export const INSTRUCTOR_NAV: AdminNavSection[] = [
    { type: 'item', title: 'Dashboard', href: admin.dashboard().url, icon: LayoutDashboard },
    { type: 'item', title: 'Course Saya', href: admin.courses.index().url, icon: BookCopy },
    { type: 'item', title: 'Peserta Saya', href: admin.myStudents.index().url, icon: Users },
    { type: 'item', title: 'Ulasan', href: admin.reviews.index().url, icon: Star },
    { type: 'item', title: 'Pendapatan & Penarikan', href: admin.myEarnings.index().url, icon: Wallet },
    { type: 'item', title: 'Pesan', href: messages.index().url, icon: MessageSquare },
    { type: 'item', title: 'AI Tutor (Ide Referensi)', href: myTutor.index().url, icon: Bot },
    { type: 'item', title: 'Profil Mentor', href: admin.myProfile.edit().url, icon: GraduationCap },
];

/**
 * Employee = karyawan tenant (B2B). Course di-assign HR, fokus pada
 * pengembangan kompetensi sesuai jabatan. Tidak ada konsep checkout.
 */
export const EMPLOYEE_NAV: AdminNavSection[] = [
    { type: 'divider', label: 'Belajar Saya' },
    { type: 'item', title: 'Dashboard', href: appDashboard().url, icon: LayoutDashboard },
    { type: 'item', title: 'Kelas Saya', href: myCourses.index().url, icon: BookOpen },
    { type: 'item', title: 'Insight Belajar', href: '/my-insights', icon: TrendingUp },
    { type: 'item', title: 'Learning Path', href: myPaths.index().url, icon: Compass },
    { type: 'item', title: 'AI Tutor', href: myTutor.index().url, icon: Bot },
    { type: 'item', title: 'Catatan Saya', href: myNotes.index().url, icon: NotebookPen },

    { type: 'divider', label: 'Karier' },
    { type: 'item', title: 'Skill Matrix Saya', href: mySkillMatrix.show().url, icon: Target },
    { type: 'item', title: 'Rekomendasi Training', href: myRecommendations.index().url, icon: Sparkles },
    { type: 'item', title: 'Sertifikat Saya', href: myCertificates.index().url, icon: Award },

    { type: 'divider', label: 'Komunikasi' },
    { type: 'item', title: 'Pesan', href: messages.index().url, icon: MessageSquare },
];

/**
 * User Public = marketplace customer (B2C). Browse katalog, beli course
 * sendiri, fokus pada pembelajaran mandiri. Tidak ada skill matrix.
 */
export const USER_PUBLIC_NAV: AdminNavSection[] = [
    { type: 'divider', label: 'Marketplace' },
    { type: 'item', title: 'Dashboard', href: appDashboard().url, icon: LayoutDashboard },
    { type: 'item', title: 'Katalog Kursus', href: courses.index().url, icon: BookCopy },
    { type: 'item', title: 'Paket Kursus', href: bundles.index().url, icon: Package },
    { type: 'item', title: 'Learning Path', href: myPaths.index().url, icon: Compass },

    { type: 'divider', label: 'Pembelajaran' },
    { type: 'item', title: 'Kelas Saya', href: myCourses.index().url, icon: BookOpen },
    { type: 'item', title: 'Insight Belajar', href: '/my-insights', icon: TrendingUp },
    { type: 'item', title: 'Catatan Saya', href: myNotes.index().url, icon: NotebookPen },
    { type: 'item', title: 'Pencapaian Saya', href: myAchievements.index().url, icon: Trophy },
    { type: 'item', title: 'Poin & Streak', href: '/my-points', icon: Coins },
    { type: 'item', title: 'Tukar Voucher', href: '/redeem', icon: Tag },
    { type: 'item', title: 'Sertifikat Saya', href: myCertificates.index().url, icon: Award },

    { type: 'divider', label: 'Transaksi' },
    { type: 'item', title: 'Langganan Saya', href: '/my-subscription', icon: Crown },
    { type: 'item', title: 'Pesanan Saya', href: orders.index().url, icon: Receipt },
    { type: 'item', title: 'Pesan', href: messages.index().url, icon: MessageSquare },
];

/**
 * Backward-compatible default for users who haven't been migrated yet
 * (fallback when role tidak terdeteksi).
 */
export const STUDENT_NAV: AdminNavSection[] = USER_PUBLIC_NAV;
