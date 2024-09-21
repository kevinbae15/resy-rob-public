import { Providers } from '@/components/providers';
import Image from 'next/image';
import ResyRobMascotImage from "../public/resy_rob_mascot.webp"
import 'tailwindcss/tailwind.css'

export default function MyApp({
  Component, pageProps
}: any) {
  return (
    <>
      <Providers>
        <main className="flex min-h-screen flex-col">
          <div className="flex grow flex-col gap-4 md:flex-row bg-[#fff9f7]">
            <div className="flex items-center justify-center px-6 py-10 md:w-2/5 md:px-20 bg-[#fff9f7]">
              <Image src={ResyRobMascotImage} alt="Resy Rob Mascot" />
            </div>
            <div className="flex flex-grow flex-col items-center justify-center px-6 py-10 md:w-2/5 md:px-20 shadow-lg bg-white">
            <Component {...pageProps} />
            </div>
          </div>
        </main>
      </Providers>
    </>
  );
}