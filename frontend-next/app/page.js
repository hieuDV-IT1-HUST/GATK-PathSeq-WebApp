"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();

  return (
      <>
          <div
              className="fixed inset-0 -z-10 bg-cover bg-center"
              style={{
                  backgroundImage: "url(/Full_Moon.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
              }}
          />
          <main className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-[32px] items-center text-center text-white drop-shadow-lg bg-black/60 px-16 py-10 rounded-lg z-10 max-w-full w-[min(100vw,600px)] border border-white/20 backdrop-blur-md">
              <Image
                  src="/broad-institute.png"
                  alt="Broad Institute logo"
                  width={180}
                  height={38}
                  priority
              />
              <h1 className="text-2xl font-bold mb-2">Chào mừng đến với</h1>
              <div className="text-3xl font-extrabold mb-4 text-blue-300">
                  GATK PathSeq WebApp
              </div>
              <p className="mb-6">
                  Vui lòng đăng nhập, đăng ký hoặc lấy lại mật khẩu để tiếp tục
                  sử dụng hệ thống.
              </p>
              <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
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
          <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-[24px] flex-wrap items-center justify-center text-white drop-shadow-lg bg-black/60 px-6 py-2 rounded-lg z-10 border border-white/20 backdrop-blur-md">
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
      </>
  );
}
