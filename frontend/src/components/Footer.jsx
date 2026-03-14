export default function Footer() {
    return (
      <footer
        className="
          w-full text-center py-4 text-sm text-white/70
          bg-gradient-to-r from-green-900/60 via-slate-900/70 to-blue-900/60
          border-t border-white/10
        "
      >
        © {new Date().getFullYear()} Smart Utility Monitoring System. All rights reserved.
      </footer>
    );
  }
  