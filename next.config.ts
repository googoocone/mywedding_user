/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ remotePatterns에 Firebase Storage 호스트와 경로 패턴을 추가합니다.
    remotePatterns: [
      {
        protocol: 'https', // 사용하는 프로토콜 (http 또는 https)
        hostname: 'firebasestorage.googleapis.com', // 오류 메시지에 나온 호스트 이름
        // ✅ pathname: Firebase Storage의 이미지 경로 패턴
        // /v0/b/ (버전/버킷) 다음에 오는 버킷 이름과 /o/ (객체) 이후의 경로를 허용합니다.
        // ** 는 0개 이상의 디렉토리를 의미합니다.
        pathname: '/v0/b/**',
         // 만약 특정 버킷의 이미지들만 허용하고 싶다면 pathname을 더 구체적으로 지정합니다.
         // 예: pathname: '/v0/b/mywedding-136d8.appspot.com/o/**' // 실제 버킷 이름 사용
      },
    ],
    // 참고: 구 버전 next.config.js에서는 domains 배열을 사용했습니다.
    // domains: ['firebasestorage.googleapis.com'], // 이 방식도 작동하지만 remotePatterns 권장
  },
  // 이곳에 다른 Next.js 설정들이 있을 수 있습니다.
  // 예: reactStrictMode: true,
  // env: { /* ... */ },
};

module.exports = nextConfig;