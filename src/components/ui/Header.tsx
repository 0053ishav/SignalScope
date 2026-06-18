import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md
      "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-violet-500
              to-blue-500
              font-bold
              text-white
            "
          >
            S
          </div>

          <div>
            <p className="font-semibold">SignalScope</p>

            <p className="text-xs text-muted">Music Intelligence</p>
          </div>
        </Link>

        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            rounded-full
            border
            border-border
            px-4
            py-2
            text-sm
            text-muted
          "
        >
          Musicathon 2026
        </div>
      </div>
    </header>
  );
}
