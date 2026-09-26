/* 날아라 아유 보드 — 오프라인 실행용 서비스 워커
   화면(HTML)은 네트워크 우선: 새 버전을 올리면 바로 반영된다.
   아이콘·글꼴은 캐시 우선: 인터넷이 없어도 앱이 그대로 뜬다.
   학습 기록은 캐시가 아니라 localStorage 에 있으므로 캐시를 비워도 사라지지 않는다. */

var VERSION = "ayuboard-2026-09-26s";
var PREFIX = "ayuboard-";
var SHELL = PREFIX + "shell-" + VERSION;

var SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./manifest.webmanifest?v=r6",
  "./apple-touch-icon-r6.png",
  "./apple-touch-icon-precomposed.png",
  "./icon-180-r6.png",
  "./icon-192-r6.png",
  "./icon-512-r6.png",
  "./icon-maskable-512-r6.png",
  "./favicon-48-r6.png",
  "./ayu-avatar-r3.png",
  "./Jua-Korean.woff2",
  "./KakaoSmallSans-Regular.woff2",
  "./KakaoSmallSans-Bold.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SHELL).then(function (c) {
      return Promise.all(SHELL_FILES.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        /* 같은 주소의 다른 앱(도아 킥·도아 셈) 캐시는 건드리지 않는다 */
        if (k.indexOf(PREFIX) === 0 && k !== SHELL) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (e) {
  if (e.data === "skip-waiting") self.skipWaiting();
});

function networkFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(SHELL).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || caches.match("./index.html");
    });
  });
}

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(SHELL).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;   /* 함께 보기(Firebase) 요청은 그대로 통과 */
  if (req.mode === "navigate") { e.respondWith(networkFirst(req)); return; }
  /* 아이콘·매니페스트는 늘 새것을 먼저 — 아이콘을 바꿔도 예전 그림이 남지 않게 */
  if (/\.(png|webmanifest)$/.test(url.pathname)) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(cacheFirst(req));
});
