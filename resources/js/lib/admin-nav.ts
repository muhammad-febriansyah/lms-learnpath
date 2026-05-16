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
    Compass,
    CreditCard,
    FolderOpen,
    Gauge,
    GitBranch,
    GraduationCap,
    LayoutDashboard,
    Mail,
    MessageSquare,
    NotebookPen,
    Package,
    Receipt,
    Settings,
    ShieldCheck,
    Sparkles,
    Star,
    Tag,
    Target,
    Ticket,
    TrendingDown,
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
import myNotes from '@/routes/my-notes';
import myCourses from '@/routes/my-courses';
import myPaths from '@/routes/my-paths';
import myRecommendations from '@/routes/my-recommendations';
import mySkillMatrix from '@/routes/my-skill-matrix';
import myTutor from '@/routes/my-tutor';
import orders from '@/routes/orders';
import profile from '@/routes/profile';

export type AdminNavItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
    permission?: string;
    roles?: string[];
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
};

export type AdminNavSection = AdminNavRoot | (AdminNavGroup & { type: 'group' });

export const ADMIN_NAV: AdminNavSection[] = [
    {
        type: 'item',
        title: 'Dashboard',
        href: admin.dashboard().url,
        icon: LayoutDashboard,
    },

    {
        type: 'group',
        label: 'Master Data',
        icon: BookOpen,
        items: [
            { title: 'Course', href: admin.courses.index().url, icon: BookCopy, permission: 'course.view' },
            { title: 'Category', href: admin.categories.index().url, icon: FolderOpen, permission: 'category.manage' },
            { title: 'Tag', href: admin.tags.index().url, icon: Tag, permission: 'tag.manage' },
            { title: 'Enrollment', href: admin.enrollments.index().url, icon: ClipboardList, permission: 'enrollment.view' },
            { title: 'Assessment', href: admin.assessments.index().url, icon: ClipboardCheck, permission: 'assessment.manage' },
            { title: 'Certificate', href: admin.certificates.index().url, icon: Award, permission: 'certificate.view' },
            { title: 'SCORM Package', href: admin.scormPackages.index().url, icon: Package, permission: 'lesson.manage' },
            { title: 'Paket Kursus', href: admin.bundles.index().url, icon: Package, permission: 'bundle.manage' },
            { title: 'Learning Path', href: admin.learningPaths.index().url, icon: Compass, permission: 'learning_path.manage' },
        ],
    },

    {
        type: 'group',
        label: 'Marketplace',
        icon: Wallet,
        items: [
            { title: 'Order', href: admin.orders.index().url, icon: Receipt, permission: 'order.view' },
            { title: 'Payment', href: admin.payments.index().url, icon: CreditCard, permission: 'payment.view' },
            { title: 'Voucher', href: admin.coupons.index().url, icon: Ticket, permission: 'coupon.manage' },
            { title: 'Review', href: admin.reviews.index().url, icon: Star, permission: 'review.moderate' },
            { title: 'Instructor', href: admin.instructors.index().url, icon: GraduationCap, permission: 'user.view' },
        ],
    },

    {
        type: 'group',
        label: 'Business',
        icon: Building2,
        roles: ['super_admin', 'admin', 'hr'],
        items: [
            { title: 'Dashboard', href: business.dashboard().url, icon: Gauge, roles: ['super_admin', 'admin', 'hr'] },
            { title: 'Laporan', href: business.reports.index().url, icon: BarChart3, roles: ['super_admin', 'admin', 'hr'] },
            { title: 'Members', href: business.members.index().url, icon: Users, roles: ['super_admin', 'admin', 'hr'] },
            { title: 'Invitations', href: business.invitations.index().url, icon: Mail, roles: ['super_admin', 'admin', 'hr'] },
        ],
    },

    {
        type: 'group',
        label: 'Skill Matrix',
        icon: Target,
        permission: 'skill_matrix.view',
        items: [
            { title: 'Dashboard', href: admin.skillMatrix.index().url, icon: Gauge, permission: 'skill_matrix.view' },
            { title: 'Master Jabatan', href: admin.positions.index().url, icon: Briefcase, permission: 'position.manage' },
            { title: 'Master Kompetensi', href: admin.competencies.index().url, icon: BadgeCheck, permission: 'competency.manage' },
            { title: 'Target Kompetensi Jabatan', href: admin.positionCompetencyTargets.index().url, icon: Target, permission: 'skill_matrix.manage' },
            { title: 'Mapping Course Kompetensi', href: admin.courseCompetencyMappings.index().url, icon: GitBranch, permission: 'skill_matrix.manage' },
            { title: 'OJT Assessment', href: admin.ojtAssessments.index().url, icon: ClipboardCheck, permission: 'ojt.review' },
            { title: 'Supervisor Review', href: admin.supervisorReviews.index().url, icon: ShieldCheck, permission: 'supervisor_review.approve' },
            { title: 'Skill Gap', href: admin.skillGaps.index().url, icon: TrendingDown, permission: 'skill_matrix.view' },
            { title: 'Rekomendasi Training', href: admin.trainingRecommendations.index().url, icon: Sparkles, permission: 'skill_matrix.view' },
        ],
    },

    {
        type: 'group',
        label: 'User Management',
        icon: Users,
        items: [
            { title: 'Users', href: admin.users.index().url, icon: Users, permission: 'user.view' },
            { title: 'Roles & Permissions', href: admin.roles.index().url, icon: ShieldCheck, permission: 'role.manage' },
        ],
    },

    {
        type: 'group',
        label: 'Reports',
        icon: BarChart3,
        permission: 'report.view',
        items: [
            { title: 'Course Progress', href: admin.reports.courseProgress().url, icon: TrendingDown, permission: 'report.view' },
            { title: 'Assessment', href: admin.reports.assessment().url, icon: ClipboardCheck, permission: 'report.view' },
            { title: 'Certificate', href: admin.reports.certificate().url, icon: Award, permission: 'report.view' },
            { title: 'Skill Gap', href: admin.reports.skillGap().url, icon: Target, permission: 'report.view' },
            { title: 'Sales & Revenue', href: admin.reports.sales().url, icon: Banknote, permission: 'report.view' },
        ],
    },

    {
        type: 'item',
        title: 'Settings',
        href: admin.settings.index().url,
        icon: Settings,
        permission: 'settings.view',
    },
];

export const STUDENT_NAV: AdminNavSection[] = [
    { type: 'item', title: 'Dashboard', href: appDashboard().url, icon: LayoutDashboard },
    { type: 'item', title: 'Katalog Kursus', href: courses.index().url, icon: BookCopy },
    { type: 'item', title: 'Paket Kursus', href: bundles.index().url, icon: Package },
    { type: 'item', title: 'Learning Path', href: myPaths.index().url, icon: Compass },
    { type: 'item', title: 'Kelas Saya', href: myCourses.index().url, icon: BookOpen },
    { type: 'item', title: 'AI Tutor', href: myTutor.index().url, icon: Bot },
    { type: 'item', title: 'Catatan Saya', href: myNotes.index().url, icon: NotebookPen },
    { type: 'item', title: 'Pencapaian Saya', href: myAchievements.index().url, icon: Trophy },
    { type: 'item', title: 'Sertifikat Saya', href: myCertificates.index().url, icon: Award },
    { type: 'item', title: 'Skill Matrix Saya', href: mySkillMatrix.show().url, icon: Target },
    { type: 'item', title: 'Rekomendasi Training', href: myRecommendations.index().url, icon: Sparkles },
    { type: 'item', title: 'Pesan', href: messages.index().url, icon: MessageSquare },
    { type: 'item', title: 'Pesanan Saya', href: orders.index().url, icon: Receipt },
];
