"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
              <Image
                  className="dark:invert"
                  src="/broad-institute.svg"
                  alt="Next.js logo"
                  width={180}
                  height={38}
                  priority
              />
              <h1 className="text-2xl font-bold text-center mb-4">
                  Chào mừng đến với GATK PathSeq WebApp
              </h1>
              <p className="text-center mb-6">
                  Vui lòng đăng nhập, đăng ký hoặc lấy lại mật khẩu để tiếp tục
                  sử dụng hệ thống.
              </p>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button
                      className="rounded bg-blue-600 text-white py-2 px-4 font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => router.push("/login")}
                  >
                      Đăng nhập
                  </button>
                  <button
                      className="rounded bg-green-600 text-white py-2 px-4 font-semibold hover:bg-green-700 transition-colors"
                      onClick={() => router.push("/register")}
                  >
                      Đăng ký
                  </button>
                  <button
                      className="rounded bg-gray-400 text-white py-2 px-4 font-semibold hover:bg-gray-500 transition-colors"
                      onClick={() => router.push("/forgot-password")}
                  >
                      Quên mật khẩu
                  </button>
              </div>
          </main>
          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
              <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="https://soict.hust.edu.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  <Image
                      aria-hidden
                      src="/SoICT_logo.png"
                      alt="SoICT icon"
                      width={64}
                      height={64}
                  />
                  SOICT - HUST
              </a>
              <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="mailto:hauldhut@gmail.com"
              >
                  <Image
                      aria-hidden
                      src="/Mail.svg"
                      alt="Mail icon"
                      width={32}
                      height={32}
                  />
                  hauldhut@gmail.com
              </a>
              <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="mailto:hieu.dv224980@sis.hust.edu.vn"
              >
                  <Image
                      aria-hidden
                      src="/Mail.svg"
                      alt="Mail icon"
                      width={32}
                      height={32}
                  />
                  hieu.dv224980@sis.hust.edu.vn
              </a>
          </footer>
      </div>
  );
}
