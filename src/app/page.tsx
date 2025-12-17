'use client'
import Image from "next/image";
import images from "@/assets";
import Button from "@/components/Button/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black bg-white" >
      <main className="flex w-full max-w-4xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-6xl">
          Welcome to <span className="text-blue-600">Chart App!</span>
        </h1>

        <div className="relative h-100 w-full max-w-3xl">
          <Image
            src={images.chartImg}
            alt="Chart App Image"
            fill
            className="object-contain"
          />
        </div>
        <div className="mt-8 flex gap-4 justify-center w-full">
          <Button children={"ECharts"}
            variant="primary"
            disabled={false}
            type="button"
            onClick={() => {
              router.push("/echarts");
            }}
          />
          <Button children={"HighCharts"}
            variant="secondary"
            disabled={false}
            onClick={() => {
              router.push("/highcharts");
            }}
          />
        </div>
      </main>
    </div>
  );
}
