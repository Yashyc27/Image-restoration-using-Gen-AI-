import Link from "next/link";

const currentYear = () => {
  const date = new Date();
  return date.getFullYear();
};

export default function Footer() {
  return (
    <footer className="mt-5 mb-3 flex h-16 w-full flex-col items-center justify-between space-y-2 border-t px-3 pt-4 text-center sm:mb-0 sm:h-20 sm:flex-row sm:pt-2">
      <div>
   
        <Link
          href="/"
          className="font-bold underline-offset-2 transition hover:underline"
        >
          
        </Link>
        .
      </div>
     
    </footer>
  );
}
