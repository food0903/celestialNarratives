import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col justify-center items-center h-screen">
      <div className="w-40">
        <Link href="/lobby">
          <div className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-8 text-center">
            PLAY NOW!
          </div>
        </Link>
        <Link href="/about">
          <div className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-8 text-center">
            ABOUT
          </div>
        </Link>
        <Link href="/rules">
          <div className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-8 text-center">
            RULES
          </div>
        </Link>
        <Link href="/cards-collection">
          <div className="block w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-8 text-center">
            Cards Collection
          </div>
        </Link>
      </div>
    </div>
    </main>
  );
}
