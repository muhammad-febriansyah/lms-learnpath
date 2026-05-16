import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="grid aspect-square size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left leading-tight">
                <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
                    Learnpath
                </span>
                <span className="text-[10px] font-medium tracking-[0.16em] text-slate-400 uppercase">
                    Admin Console
                </span>
            </div>
        </>
    );
}
