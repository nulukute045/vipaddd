# codex-web-cli

CLI hỗ trợ workflow **terminal -> Codex Cloud** cho repo GitHub.

## Cài đặt

```bash
npm install -g .
```

Nếu gặp lỗi `MODULE_NOT_FOUND` như thiếu `bin/codex-web.js` hoặc `lib/cli.js`, chạy lại:

```bash
npm uninstall -g codex-web-cli
npm install -g codex-web-cli
# hoặc nếu cài từ source local
npm install -g .
```

## Lệnh chính

- `codex-web open` / `codex-web cloud`: mở `https://chatgpt.com/codex/cloud`
- `codex-web connect`: in thông tin repo/branch hiện tại và các bước handoff sang Cloud
- `codex-web connect --open`: vừa in steps vừa mở Cloud
- `codex-web status`: xem nhanh trạng thái git + link cloud
- `codex-web repo`: xem root/branch/origin
- `codex-web pr`: mở trang compare PR cho branch hiện tại
- `codex-web handoff`: push branch hiện tại lên origin

## Lưu ý

`chatgpt.com/codex/cloud` hiện không có public terminal API để chạy trực tiếp 100% trong terminal như một backend CLI riêng.
