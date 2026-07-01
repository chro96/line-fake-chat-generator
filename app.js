(function () {
  "use strict";

  const STORAGE_KEY = "line-fake-chat-generator-data-v1";
  const DEFAULT_COLOR = "#8eaddb";
  const SAMPLE_STICKER_IMAGE = "assets/sample-ok-sticker.png";
  const STICKER_SAMPLE_VERSION = "sample-ok-sticker-2";

  const emptyState = {
    partnerName: "田中太郎",
    statusTime: "21:34",
    backgroundColor: DEFAULT_COLOR,
    partnerIcon: "",
    backgroundImage: "",
    stickerSampleVersion: STICKER_SAMPLE_VERSION,
    messages: [],
  };

  const demoState = {
    ...emptyState,
    partnerName: "ゆうた",
    messages: [
      { id: "date-1", kind: "date", text: "7月1日(水)" },
      {
        id: "m-1",
        kind: "other",
        text: "ねえ、今日ほんとに来るよね？\nもう駅ついたんだけど〜",
      },
      {
        id: "m-2",
        kind: "self",
        text: "行くってば笑\nあと10分くらい、待ってて",
      },
      {
        id: "sticker-1",
        kind: "sticker",
        stickerSender: "other",
        stickerImage: SAMPLE_STICKER_IMAGE,
        stickerText: "まってる",
        stickerSize: 168,
      },
      {
        id: "notice-1",
        kind: "notice",
        text: "ゆうたがメッセージの送信を取り消しました",
      },
      {
        id: "m-3",
        kind: "other",
        text: "さっきの誤字、見なかったことにして笑\nここで待ってる\nhttps://example.com/cafe-map",
        linkTitle: "いつものカフェ",
        linkDescription: "駅からすぐの、前に一緒に行ったお店。窓際の席にいるよ。",
        thumbnailImage: "",
        showLinkCard: true,
        showPreviewPlayButton: false,
      },
      {
        id: "m-4",
        kind: "other",
        text: "てかお腹すいた。\n早く来て",
      },
      {
        id: "m-5",
        kind: "self",
        text: "はいはい笑\n着いたら甘いの半分ちょうだい",
      },
      {
        id: "m-6",
        kind: "other",
        text: "半分どころか一口だけね。\n急いで〜",
      },
      {
        id: "sticker-2",
        kind: "sticker",
        stickerSender: "self",
        stickerImage: SAMPLE_STICKER_IMAGE,
        stickerText: "OK!",
        stickerSize: 156,
      },
    ],
  };

  const app = document.getElementById("app");
  let state = loadState();
  let selectedId = pickInitialMessage(state);
  let includeFrame = false;
  let saving = false;

  const ICONS = {
    camera:
      '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>',
    clock:
      '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    copy:
      '<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
    download:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
    menu:
      '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>',
    message:
      '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>',
    mic:
      '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line>',
    phone:
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z"></path>',
    play:
      '<polygon points="7 4 19 12 7 20 7 4" fill="currentColor" stroke="none"></polygon>',
    plus:
      '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
    rotate:
      '<path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.7L3 8"></path><path d="M3 3v5h5"></path>',
    settings:
      '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
    smile:
      '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line>',
    trash:
      '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>',
    upload:
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line>',
    user:
      '<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
    up:
      '<path d="M8 6 12 2l4 4"></path><path d="M12 2v20"></path>',
    down:
      '<path d="m8 18 4 4 4-4"></path><path d="M12 2v20"></path>',
  };

  function icon(name, size = 18, className = "") {
    return `<svg class="icon ${className}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  function uid(prefix = "m") {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function normalizeState(data) {
    const stickerSampleVersion = data && data.stickerSampleVersion;
    const next = { ...cloneData(emptyState), ...(data || {}) };
    next.partnerName = String(next.partnerName || emptyState.partnerName);
    next.statusTime = normalizeTime(next.statusTime);
    next.backgroundColor = normalizeColor(next.backgroundColor);
    next.partnerIcon = String(next.partnerIcon || "");
    next.backgroundImage = String(next.backgroundImage || "");
    next.stickerSampleVersion = String(next.stickerSampleVersion || "");
    next.messages = Array.isArray(next.messages)
      ? next.messages.map(normalizeMessage)
      : [];
    if (stickerSampleVersion !== STICKER_SAMPLE_VERSION) {
      next.messages = next.messages.map((message) =>
        message.kind === "sticker" && !message.stickerImage
          ? { ...message, stickerImage: SAMPLE_STICKER_IMAGE }
          : message,
      );
      if (shouldAppendDemoStickerEnding(next.messages)) {
        next.messages.push({
          id: "sticker-2",
          kind: "sticker",
          text: "",
          stickerSender: "self",
          stickerImage: SAMPLE_STICKER_IMAGE,
          stickerText: "OK!",
          stickerSize: 156,
        });
      }
      next.stickerSampleVersion = STICKER_SAMPLE_VERSION;
    }
    return next;
  }

  function shouldAppendDemoStickerEnding(messages) {
    const hasEndingSticker = messages.some((message) => message.id === "sticker-2");
    const hasOldDemoLastLine = messages.some(
      (message) =>
        message.id === "m-6" &&
        message.kind === "other" &&
        message.text === "半分どころか一口だけね。\n急いで〜",
    );
    return hasOldDemoLastLine && !hasEndingSticker;
  }

  function messageIdPrefix(kind) {
    if (kind === "date") return "date";
    if (kind === "notice") return "notice";
    if (kind === "sticker") return "sticker";
    return "m";
  }

  function defaultStickerText() {
    return "OK!";
  }

  function clampStickerSize(value) {
    const size = Number(value);
    if (!Number.isFinite(size)) return 168;
    return Math.min(240, Math.max(96, Math.round(size)));
  }

  function normalizeMessage(message, index) {
    const allowed = new Set(["other", "self", "date", "notice", "sticker"]);
    const kind = allowed.has(message && message.kind) ? message.kind : "other";
    return {
      id: String((message && message.id) || uid(messageIdPrefix(kind))),
      kind,
      text: String((message && message.text) || ""),
      linkTitle: String((message && message.linkTitle) || ""),
      linkDescription: String((message && message.linkDescription) || ""),
      thumbnailImage: String((message && message.thumbnailImage) || ""),
      stickerSender: message && message.stickerSender === "self" ? "self" : "other",
      stickerImage: String((message && message.stickerImage) || ""),
      stickerText: String((message && message.stickerText) || defaultStickerText()),
      stickerSize: clampStickerSize(message && message.stickerSize),
      showLinkCard:
        typeof (message && message.showLinkCard) === "boolean"
          ? message.showLinkCard
          : true,
      showPreviewPlayButton:
        typeof (message && message.showPreviewPlayButton) === "boolean"
          ? message.showPreviewPlayButton
          : true,
    };
  }

  function normalizeTime(value) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return emptyState.statusTime;
    const hour = Math.min(23, Math.max(0, Number(match[1])));
    const minute = Math.min(59, Math.max(0, Number(match[2])));
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function normalizeColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : DEFAULT_COLOR;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : cloneData(demoState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return cloneData(demoState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function pickInitialMessage(data) {
    return data.messages[1]?.id || data.messages[0]?.id || "";
  }

  function selectedMessage() {
    return state.messages.find((message) => message.id === selectedId) || null;
  }

  function setState(updater, options = {}) {
    const focus = options.preserveFocus === false ? null : getFocusState();
    const result = typeof updater === "function" ? updater(cloneData(state)) : updater;
    state = normalizeState(result);
    if (selectedId && !state.messages.some((message) => message.id === selectedId)) {
      selectedId = state.messages[0]?.id || "";
    }
    saveState();
    render(focus);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function detectUrl(text) {
    const clean = String(text || "").replace(/[\u200B-\u200D\uFEFF]/g, "");
    const url = clean.match(/(?:https?:\/\/|www\.)\S+/i)?.[0];
    if (url) return url;
    return clean.match(/[a-z0-9-]+\.[a-z]{2,}(?:\/\S*)?/i)?.[0] || "";
  }

  function splitTextWithLinks(text) {
    const parts = String(text || "").split(
      /((?:https?:\/\/|www\.)[^\s]+|[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi,
    );
    return parts
      .map((part, index) => {
        if (!part) return "";
        const safe = escapeHtml(part);
        if (detectUrl(part)) {
          return `<span class="inline-link" data-link-index="${index}">${safe}</span>`;
        }
        return `<span>${safe}</span>`;
      })
      .join("");
  }

  function linkDefaults(message) {
    const textLines = String(message.text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !detectUrl(line));
    return {
      title: message.linkTitle.trim() || textLines[0] || "リンクプレビュー",
      description:
        message.linkDescription.trim() ||
        textLines.slice(1).join("\n") ||
        detectUrl(message.text),
    };
  }

  function messageLabel(message) {
    if (message.kind === "date") return "日付";
    if (message.kind === "notice") return "通知";
    if (message.kind === "sticker") {
      return message.stickerSender === "self"
        ? "自分スタンプ"
        : `${state.partnerName || "相手"}スタンプ`;
    }
    if (message.kind === "self") return "自分";
    return state.partnerName || "相手";
  }

  function messagePreviewText(message) {
    if (message.kind === "sticker") {
      if (message.stickerImage) return "スタンプ画像";
      return `スタンプ: ${message.stickerText || defaultStickerText()}`;
    }
    return message.text || " ";
  }

  function getFocusState() {
    const element = document.activeElement;
    if (!element || !element.dataset || !element.dataset.focusKey) return null;
    return {
      key: element.dataset.focusKey,
      start: "selectionStart" in element ? element.selectionStart : null,
      end: "selectionEnd" in element ? element.selectionEnd : null,
    };
  }

  function restoreFocus(focus) {
    if (!focus) return;
    const element = app.querySelector(`[data-focus-key="${focus.key}"]`);
    if (!element) return;
    element.focus({ preventScroll: true });
    if (focus.start !== null && "setSelectionRange" in element) {
      element.setSelectionRange(focus.start, focus.end);
    }
  }

  function render(focus = null) {
    const selected = selectedMessage();
    app.innerHTML = `
      <main class="page-shell">
        <header class="notice">
          <div class="notice-title">${icon("message", 20)}架空LINEトーク作成ツール</div>
          <p>架空のトーク画像作成用です。公開・共有時は、なりすまし・権利侵害・誤認を招く利用を避け、ご自身の責任でご利用ください。</p>
        </header>
        <div class="workspace">
          <section class="editor">
            ${renderSettingsPanel()}
            ${renderMessagesPanel(selected)}
            ${renderDataPanel()}
          </section>
          <aside class="preview-column">
            ${renderPhone()}
            <label class="save-frame">
              <input type="checkbox" data-action="toggle-frame" ${includeFrame ? "checked" : ""} />
              スマホの枠込みで保存
            </label>
            <button class="save-button" data-action="save-png" ${saving ? "disabled" : ""}>
              ${icon("camera", 19)}${saving ? "保存中..." : "画像として保存（PNG）"}
            </button>
          </aside>
        </div>
      </main>
    `;
    restoreFocus(focus);
  }

  function renderSettingsPanel() {
    const iconPreview = state.partnerIcon
      ? `<img src="${escapeAttr(state.partnerIcon)}" alt="" />`
      : icon("user", 42);
    const bgStyle = [
      `background-color:${escapeAttr(state.backgroundColor)}`,
      state.backgroundImage
        ? `background-image:url("${escapeAttr(state.backgroundImage)}")`
        : "",
    ]
      .filter(Boolean)
      .join(";");

    return `
      <div class="panel settings-panel">
        <h2>${icon("settings", 20)}全体設定</h2>
        <div class="settings-grid">
          <section class="settings-group profile-group" aria-labelledby="profile-settings-title">
            <div class="settings-group-title" id="profile-settings-title">${icon("user", 18)}プロフィール</div>
            <div class="profile-setting-row">
              <div class="avatar-preview">${iconPreview}</div>
              <div class="profile-fields">
                <div class="field">
                  <label for="partner-name">相手の名前</label>
                  <input id="partner-name" data-bind="partnerName" data-focus-key="partnerName" value="${escapeAttr(state.partnerName)}" />
                </div>
                <div class="image-row">
                  <button class="button secondary" data-action="choose-partner-icon">${icon("image", 16)}アイコン画像</button>
                  ${state.partnerIcon ? `<button class="link-button" data-action="clear-partner-icon">削除</button>` : ""}
                  <input id="partner-icon-input" type="file" accept="image/*" hidden />
                </div>
              </div>
            </div>
          </section>

          <section class="settings-group background-group" aria-labelledby="background-settings-title">
            <div class="settings-group-title" id="background-settings-title">${icon("image", 18)}背景</div>
            <div class="background-tools">
              <div class="background-tool wide">
                <span class="control-label">背景画像</span>
                <button class="bg-preview" type="button" data-action="choose-bg" style="${bgStyle}" aria-label="背景画像を選択">
                  ${state.backgroundImage ? "" : icon("image", 22)}
                </button>
                <div class="background-actions">
                  <button class="button secondary" data-action="choose-bg">${icon("image", 16)}選択</button>
                  ${state.backgroundImage ? `<button class="link-button" data-action="clear-bg">削除</button>` : ""}
                </div>
                <input id="background-input" type="file" accept="image/*" hidden />
              </div>
              <div class="background-tool">
                <span class="control-label">トーク背景色</span>
                <div class="color-control">
                  <input type="color" data-bind="backgroundColor" data-focus-key="backgroundColor" value="${escapeAttr(state.backgroundColor)}" aria-label="トーク背景色" />
                  <span class="color-code">${escapeHtml(state.backgroundColor.toUpperCase())}</span>
                  <button class="link-button" data-action="reset-color">標準色</button>
                </div>
              </div>
            </div>
          </section>

          <section class="settings-group time-group" aria-labelledby="display-settings-title">
            <div class="settings-group-title" id="display-settings-title">${icon("clock", 18)}表示</div>
            <div class="field">
              <label for="status-time">ステータスバーの時刻</label>
              <div class="input-icon">
                <input id="status-time" type="time" data-bind="statusTime" data-focus-key="statusTime" value="${escapeAttr(state.statusTime)}" />
                ${icon("clock", 18)}
              </div>
            </div>
          </section>

          <section class="settings-group cleanup-group" aria-labelledby="cleanup-settings-title">
            <div class="settings-group-title" id="cleanup-settings-title">${icon("trash", 18)}初期データ</div>
            <div class="cleanup-actions">
              <button class="button secondary" data-action="load-demo">${icon("message", 16)}デモを見る</button>
              <button class="button secondary" data-action="clear-messages">${icon("trash", 16)}デモ会話を消す</button>
              <button class="button danger" data-action="clear-all">${icon("rotate", 16)}全部消す</button>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderMessagesPanel(selected) {
    return `
      <div class="panel">
        <h2><span aria-hidden="true">✎</span>メッセージ<span class="count">${state.messages.length}</span></h2>
        <div class="toolbar">
          <button class="primary" data-action="add-message" data-kind="other">${icon("plus", 16)}相手の発言</button>
          <button class="primary" data-action="add-message" data-kind="self">${icon("plus", 16)}自分の発言</button>
          <button class="secondary" data-action="add-message" data-kind="sticker">${icon("smile", 16)}スタンプ</button>
          <button class="secondary" data-action="add-message" data-kind="date">${icon("plus", 16)}日付の区切り</button>
          <button class="secondary" data-action="add-message" data-kind="notice">${icon("plus", 16)}通知</button>
        </div>
        <div class="message-list" aria-label="メッセージ一覧">
          ${
            state.messages.length
              ? state.messages.map(renderMessageRow).join("")
              : `<div class="empty-state">メッセージがありません</div>`
          }
        </div>
        ${selected ? renderEditBox(selected) : ""}
      </div>
    `;
  }

  function renderMessageRow(message) {
    const selected = message.id === selectedId ? " selected" : "";
    return `
      <div class="message-row${selected}" role="button" tabindex="0" data-action="select-message" data-id="${escapeAttr(message.id)}">
        <span class="handle" aria-hidden="true">::</span>
        <span class="tag ${escapeAttr(message.kind)}">${escapeHtml(messageLabel(message))}</span>
        <span class="message-text">${escapeHtml(messagePreviewText(message))}</span>
        <span class="row-actions">
          <button class="icon-button" title="上へ" data-action="move-message" data-id="${escapeAttr(message.id)}" data-direction="-1">${icon("up", 17)}</button>
          <button class="icon-button" title="下へ" data-action="move-message" data-id="${escapeAttr(message.id)}" data-direction="1">${icon("down", 17)}</button>
          <button class="icon-button" title="複製" data-action="duplicate-message" data-id="${escapeAttr(message.id)}">${icon("copy", 17)}</button>
          <button class="icon-button" title="削除" data-action="delete-message" data-id="${escapeAttr(message.id)}">${icon("trash", 17)}</button>
        </span>
      </div>
    `;
  }

  function renderEditBox(message) {
    const hasLink = detectUrl(message.text);
    const isSticker = message.kind === "sticker";
    const canPreview = message.kind === "other" || message.kind === "self";
    return `
      <div class="edit-box">
        <div class="field">
          <label for="message-kind">種類</label>
          <select id="message-kind" data-bind="selectedKind" data-focus-key="selectedKind">
            <option value="other" ${message.kind === "other" ? "selected" : ""}>相手の発言</option>
            <option value="self" ${message.kind === "self" ? "selected" : ""}>自分の発言</option>
            <option value="sticker" ${message.kind === "sticker" ? "selected" : ""}>スタンプ</option>
            <option value="date" ${message.kind === "date" ? "selected" : ""}>日付の区切り</option>
            <option value="notice" ${message.kind === "notice" ? "selected" : ""}>通知</option>
          </select>
        </div>
        ${
          isSticker
            ? renderStickerEditor(message)
            : `
              <div class="field">
                <label for="message-text">内容</label>
                <textarea id="message-text" rows="3" data-bind="selectedText" data-focus-key="selectedText">${escapeHtml(message.text)}</textarea>
              </div>
              ${canPreview && hasLink ? renderLinkEditor(message) : ""}
            `
        }
      </div>
    `;
  }

  function renderStickerEditor(message) {
    const size = clampStickerSize(message.stickerSize);
    const preview = message.stickerImage
      ? `<img src="${escapeAttr(message.stickerImage)}" alt="" />`
      : `<span>${escapeHtml(message.stickerText || defaultStickerText())}</span>`;
    return `
      <div class="sticker-editor">
        <div class="field">
          <label for="sticker-sender">送信者</label>
          <select id="sticker-sender" data-bind="stickerSender" data-focus-key="stickerSender">
            <option value="other" ${message.stickerSender !== "self" ? "selected" : ""}>相手</option>
            <option value="self" ${message.stickerSender === "self" ? "selected" : ""}>自分</option>
          </select>
        </div>
        <div class="field">
          <label for="sticker-text">画像なしの文字</label>
          <input id="sticker-text" data-bind="stickerText" data-focus-key="stickerText" maxlength="18" value="${escapeAttr(message.stickerText || defaultStickerText())}" />
        </div>
        <div class="field wide">
          <label>スタンプ画像（任意）</label>
          <div class="image-row">
            <div class="sticker-preview">${preview}</div>
            <button class="button secondary" data-action="choose-sticker">${icon("image", 16)}画像を選択</button>
            ${message.stickerImage ? `<button class="link-button" data-action="clear-sticker">削除</button>` : ""}
            <input id="sticker-input" type="file" accept="image/*" hidden />
          </div>
        </div>
        <div class="field wide">
          <label for="sticker-size">表示サイズ</label>
          <div class="sticker-size-row">
            <input id="sticker-size" type="range" min="96" max="240" step="4" data-bind="stickerSize" data-focus-key="stickerSize" value="${escapeAttr(size)}" />
            <span class="sticker-size-value">${escapeHtml(size)}px</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderLinkEditor(message) {
    const defaults = linkDefaults(message);
    const thumb = message.thumbnailImage
      ? `<img src="${escapeAttr(message.thumbnailImage)}" alt="" />`
      : icon("image", 24);
    return `
      <div class="link-editor">
        <label class="check-row">
          <input type="checkbox" data-bind="showLinkCard" ${message.showLinkCard ? "checked" : ""} />
          URLプレビューカードを表示する
        </label>
        ${
          message.showLinkCard
            ? `
              <div class="grid-2">
                <div class="field">
                  <label for="link-title">URLプレビューのタイトル</label>
                  <input id="link-title" data-bind="linkTitle" data-focus-key="linkTitle" value="${escapeAttr(message.linkTitle)}" placeholder="${escapeAttr(defaults.title)}" />
                </div>
                <div class="field">
                  <label for="link-description">URLプレビューの説明</label>
                  <textarea id="link-description" rows="2" data-bind="linkDescription" data-focus-key="linkDescription" placeholder="${escapeAttr(defaults.description)}">${escapeHtml(message.linkDescription)}</textarea>
                </div>
              </div>
              <div class="field">
                <label>URLプレビューのサムネ画像</label>
                <div class="image-row">
                  <div class="thumb-preview">${thumb}</div>
                  <button class="button secondary" data-action="choose-thumbnail">${icon("image", 16)}画像を選択</button>
                  ${message.thumbnailImage ? `<button class="link-button" data-action="clear-thumbnail">削除</button>` : ""}
                  <input id="thumbnail-input" type="file" accept="image/*" hidden />
                </div>
              </div>
              <label class="check-row">
                <input type="checkbox" data-bind="showPreviewPlayButton" ${message.showPreviewPlayButton ? "checked" : ""} />
                再生ボタンをつける
              </label>
            `
            : ""
        }
      </div>
    `;
  }

  function renderDataPanel() {
    return `
      <div class="panel data-panel">
        <h2>データ</h2>
        <div class="toolbar">
          <button class="secondary" data-action="export-json">${icon("download", 16)}JSONエクスポート</button>
          <button class="secondary" data-action="choose-json">${icon("upload", 16)}JSONインポート</button>
          <button class="button danger" data-action="clear-all">${icon("rotate", 16)}全部消す</button>
          <input id="json-input" type="file" accept="application/json" hidden />
        </div>
        <p class="data-note">編集内容とアップロード画像はこのブラウザ内に自動保存されます。共有やバックアップにはJSONエクスポートを使えます。</p>
      </div>
    `;
  }

  function renderPhone() {
    const bgStyle = [
      `background-color:${escapeAttr(state.backgroundColor)}`,
      state.backgroundImage
        ? `background-image:url("${escapeAttr(state.backgroundImage)}")`
        : "",
    ]
      .filter(Boolean)
      .join(";");
    return `
      <div class="phone" id="capture-phone">
        <div class="phone-screen" id="capture-screen">
          <div class="chat-bg ${state.backgroundImage ? "" : "no-image"}" style="${bgStyle}">
            ${renderStatus()}
            ${renderChatHeader()}
            <div class="chat-messages">
              <div class="chat-scroll-content">
                ${state.messages.map(renderChatMessage).join("")}
              </div>
            </div>
            ${renderInputBar()}
          </div>
        </div>
      </div>
    `;
  }

  function renderStatus() {
    return `
      <div class="status">
        <span>${escapeHtml(state.statusTime)}</span>
        <span class="dynamic-island" aria-hidden="true"></span>
        <span class="iphone-status-icons" aria-hidden="true">
          <span class="signal-bars"><span></span><span></span><span></span><span></span></span>
          <svg class="wifi-icon" viewBox="0 0 26 24">
            <path d="M3.2 5.2C8.7 1.1 17.3 1.1 22.8 5.2"></path>
            <path d="M7.5 10.1C10.7 7.8 15.3 7.8 18.5 10.1"></path>
            <path class="dot" d="M10.1 15.2C11.5 13.6 14.5 13.6 15.9 15.2L13 18.8Z"></path>
          </svg>
          <span class="battery"><span class="battery-tip"></span><span class="battery-fill"></span></span>
        </span>
      </div>
    `;
  }

  function renderChatHeader() {
    return `
      <div class="chat-header">
        <span class="back" aria-hidden="true">‹</span>
        <strong>${escapeHtml(state.partnerName || "相手")}</strong>
        <span class="header-icons" aria-hidden="true">
          <svg class="line-search-icon" viewBox="0 0 24 24">
            <circle cx="9.4" cy="9.4" r="6.1" stroke-width="2.05"></circle>
            <path d="M9.4 9.4 L9.4 5.8 M9.4 9.4 L12.3 11.9" stroke-width="1.6"></path>
            <path d="M14.1 14.1 L20.1 20.1" stroke-width="2.05"></path>
          </svg>
          ${icon("phone", 22)}
          <span class="calendar-icon"><span class="calendar-top"></span><span class="calendar-box">31</span><span class="calendar-badge">N</span></span>
          ${icon("menu", 25)}
        </span>
      </div>
    `;
  }

  function renderChatMessage(message, index) {
    if (message.kind === "date") {
      return `<div class="date-chip">${escapeHtml(message.text)}</div>`;
    }
    if (message.kind === "notice") {
      return `<div class="notice-chip">${escapeHtml(message.text)}</div>`;
    }
    if (message.kind === "sticker") {
      return renderStickerMessage(message, index);
    }

    const isSelf = message.kind === "self";
    const time = index > 1 ? "14:55" : "14:43";
    const readTime = index > 3 ? "10:54" : "21:46";
    const avatar = isSelf ? "" : renderAvatar();
    const read = isSelf
      ? `<span class="read-time"><span>既読</span><span>${readTime}</span></span>`
      : "";
    const messageTime = isSelf
      ? ""
      : `<span class="message-time">${time}</span>`;
    const linkCard =
      detectUrl(message.text) && message.showLinkCard
        ? renderLinkCard(message, isSelf)
        : "";

    return `
      <div class="message-stack ${isSelf ? "self" : "other"}">
        <div class="bubble-row ${isSelf ? "self" : "other"}">
          ${avatar}
          ${read}
          <div class="bubble">${splitTextWithLinks(message.text)}</div>
          ${messageTime}
        </div>
        ${linkCard}
      </div>
    `;
  }

  function renderStickerMessage(message, index) {
    const isSelf = message.stickerSender === "self";
    const size = clampStickerSize(message.stickerSize);
    const time = index > 1 ? "14:55" : "14:43";
    const readTime = index > 3 ? "10:54" : "21:46";
    const avatar = isSelf ? "" : renderAvatar();
    const read = isSelf
      ? `<span class="read-time"><span>既読</span><span>${readTime}</span></span>`
      : "";
    const messageTime = isSelf
      ? ""
      : `<span class="message-time">${time}</span>`;
    const stickerContent = message.stickerImage
      ? `<img src="${escapeAttr(message.stickerImage)}" alt="" />`
      : `<span class="sticker-placeholder-text">${escapeHtml(message.stickerText || defaultStickerText())}</span>`;
    const imageClass = message.stickerImage ? " has-image" : "";

    return `
      <div class="message-stack sticker ${isSelf ? "self" : "other"}">
        <div class="sticker-row ${isSelf ? "self" : "other"}">
          ${avatar}
          ${read}
          <div class="sticker-frame${imageClass}" style="width:${escapeAttr(size)}px">
            ${stickerContent}
          </div>
          ${messageTime}
        </div>
      </div>
    `;
  }

  function renderAvatar() {
    return `
      <span class="chat-avatar">
        ${state.partnerIcon ? `<img src="${escapeAttr(state.partnerIcon)}" alt="" />` : icon("user", 25)}
      </span>
    `;
  }

  function renderLinkCard(message, isSelf) {
    const defaults = linkDefaults(message);
    const imageStyle = message.thumbnailImage
      ? `style="background-image:url('${escapeAttr(message.thumbnailImage)}')"`
      : "";
    return `
      <div class="link-row ${isSelf ? "self" : "other"}">
        <div class="link-card">
          <div class="link-thumb ${message.thumbnailImage ? "has-image" : ""}" ${imageStyle}>
            ${
              message.thumbnailImage
                ? ""
                : `<span class="thumb-caption top">リンク先のプレビュー</span><span class="thumb-caption bottom">詳細を確認</span>`
            }
            ${message.showPreviewPlayButton ? icon("play", 52, "play-mark") : ""}
          </div>
          <div class="link-meta">
            <span class="link-title">${escapeHtml(defaults.title)}</span>
            ${defaults.description
              .split("\n")
              .filter(Boolean)
              .slice(0, 2)
              .map((line) => `<span>${escapeHtml(line)}</span>`)
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderInputBar() {
    return `
      <div class="input-bar" aria-hidden="true">
        ${icon("plus", 28)}
        ${icon("camera", 23)}
        ${icon("image", 22)}
        <div class="input-pill"></div>
        ${icon("smile", 24)}
        ${icon("mic", 24)}
      </div>
    `;
  }

  function addMessage(kind) {
    const message = {
      id: uid(messageIdPrefix(kind)),
      kind,
      text: defaultTextByKind(kind),
    };
    if (kind === "sticker") {
      Object.assign(message, {
        text: "",
        stickerSender: "other",
        stickerImage: SAMPLE_STICKER_IMAGE,
        stickerText: defaultStickerText(),
        stickerSize: 168,
      });
    }
    selectedId = message.id;
    setState((data) => {
      data.messages.push(message);
      return data;
    }, { preserveFocus: false });
  }

  function defaultTextByKind(kind) {
    const textByKind = {
      other: "新しい相手の発言",
      self: "新しい自分の発言",
      date: "7月1日(水)",
      notice: "メッセージの送信を取り消しました",
      sticker: "",
    };
    return textByKind[kind] || textByKind.other;
  }

  function patchForKindChange(kind) {
    const allowed = new Set(["other", "self", "date", "notice", "sticker"]);
    const nextKind = allowed.has(kind) ? kind : "other";
    const current = selectedMessage();
    if (nextKind === "sticker") {
      return {
        kind: "sticker",
        text: "",
        stickerSender:
          current && current.stickerSender === "self"
            ? "self"
            : current && current.kind === "self"
              ? "self"
              : "other",
        stickerImage: (current && current.stickerImage) || SAMPLE_STICKER_IMAGE,
        stickerText: (current && current.stickerText) || defaultStickerText(),
        stickerSize: clampStickerSize(current && current.stickerSize),
      };
    }

    return {
      kind: nextKind,
      text:
        current && current.kind !== "sticker" && current.text
          ? current.text
          : defaultTextByKind(nextKind),
    };
  }

  function updateSelected(patch) {
    if (!selectedId) return;
    setState((data) => {
      data.messages = data.messages.map((message) =>
        message.id === selectedId ? { ...message, ...patch } : message,
      );
      return data;
    });
  }

  function moveMessage(id, direction) {
    setState((data) => {
      const from = data.messages.findIndex((message) => message.id === id);
      const to = from + Number(direction);
      if (from < 0 || to < 0 || to >= data.messages.length) return data;
      const [message] = data.messages.splice(from, 1);
      data.messages.splice(to, 0, message);
      return data;
    }, { preserveFocus: false });
  }

  function duplicateMessage(id) {
    setState((data) => {
      const index = data.messages.findIndex((message) => message.id === id);
      if (index < 0) return data;
      const duplicate = {
        ...data.messages[index],
        id: uid(messageIdPrefix(data.messages[index].kind)),
      };
      data.messages.splice(index + 1, 0, duplicate);
      selectedId = duplicate.id;
      return data;
    }, { preserveFocus: false });
  }

  function deleteMessage(id) {
    setState((data) => {
      data.messages = data.messages.filter((message) => message.id !== id);
      if (selectedId === id) selectedId = data.messages[0]?.id || "";
      return data;
    }, { preserveFocus: false });
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importJson(file) {
    try {
      const imported = JSON.parse(await file.text());
      state = normalizeState({ ...cloneData(emptyState), ...imported });
      selectedId = state.messages[0]?.id || "";
      saveState();
      render();
    } catch (error) {
      alert("JSONを読み込めませんでした。ファイルの内容を確認してください。");
    }
  }

  async function waitForImages(node) {
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.onload = resolve;
          image.onerror = resolve;
        });
      }),
    );
  }

  function inlineStyles(source, target) {
    if (source.nodeType !== Node.ELEMENT_NODE || target.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const computed = window.getComputedStyle(source);
    let css = "";
    for (const property of computed) {
      css += `${property}:${computed.getPropertyValue(property)};`;
    }
    target.setAttribute("style", css);

    if (source instanceof HTMLImageElement) {
      target.setAttribute("src", source.currentSrc || source.src);
    }

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);
    sourceChildren.forEach((child, index) => {
      if (targetChildren[index]) inlineStyles(child, targetChildren[index]);
    });
  }

  async function elementToPngDataUrl(node) {
    await waitForImages(node);
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const clone = node.cloneNode(true);
    inlineStyles(node, clone);

    const wrapper = document.createElement("div");
    wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.appendChild(clone);

    const html = new XMLSerializer().serializeToString(wrapper);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">${html}</foreignObject>
      </svg>
    `;
    const image = new Image();
    image.decoding = "async";
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const ratio = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
    const canvas = document.createElement("canvas");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }

  async function savePng() {
    const node = document.getElementById(includeFrame ? "capture-phone" : "capture-screen");
    const scroller = app.querySelector(".chat-messages");
    if (!node) return;
    const scrollTop = scroller ? scroller.scrollTop : 0;
    saving = true;
    render();
    await nextFrame();

    const captureNode = document.getElementById(includeFrame ? "capture-phone" : "capture-screen");
    const captureScroller = app.querySelector(".chat-messages");
    if (captureScroller) captureScroller.scrollTop = 0;
    await nextFrame();

    try {
      const dataUrl = await elementToPngDataUrl(captureNode);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "line-talk-preview.png";
      link.click();
    } catch (error) {
      alert("PNG保存に失敗しました。画像サイズを小さくするか、別のブラウザでお試しください。");
    } finally {
      saving = false;
      render();
      const restoredScroller = app.querySelector(".chat-messages");
      if (restoredScroller) restoredScroller.scrollTop = scrollTop;
    }
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  app.addEventListener("click", async (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement || !app.contains(actionElement)) return;
    const action = actionElement.dataset.action;

    if (action !== "select-message") {
      event.stopPropagation();
    }

    if (action === "select-message") {
      selectedId = actionElement.dataset.id;
      render();
      return;
    }

    if (action === "add-message") addMessage(actionElement.dataset.kind);
    if (action === "move-message") moveMessage(actionElement.dataset.id, actionElement.dataset.direction);
    if (action === "duplicate-message") duplicateMessage(actionElement.dataset.id);
    if (action === "delete-message") deleteMessage(actionElement.dataset.id);
    if (action === "choose-partner-icon") app.querySelector("#partner-icon-input")?.click();
    if (action === "clear-partner-icon") setState((data) => ({ ...data, partnerIcon: "" }));
    if (action === "choose-bg") app.querySelector("#background-input")?.click();
    if (action === "clear-bg") setState((data) => ({ ...data, backgroundImage: "" }));
    if (action === "reset-color") setState((data) => ({ ...data, backgroundColor: DEFAULT_COLOR }));
    if (action === "load-demo") {
      state = cloneData(demoState);
      selectedId = pickInitialMessage(state);
      saveState();
      render();
    }
    if (action === "clear-messages") {
      selectedId = "";
      setState((data) => ({ ...data, messages: [] }), { preserveFocus: false });
    }
    if (action === "clear-all") {
      selectedId = "";
      setState(cloneData(emptyState), { preserveFocus: false });
    }
    if (action === "choose-thumbnail") app.querySelector("#thumbnail-input")?.click();
    if (action === "clear-thumbnail") updateSelected({ thumbnailImage: "" });
    if (action === "choose-sticker") app.querySelector("#sticker-input")?.click();
    if (action === "clear-sticker") updateSelected({ stickerImage: "" });
    if (action === "export-json") {
      downloadBlob(
        new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
        "line-talk-data.json",
      );
    }
    if (action === "choose-json") app.querySelector("#json-input")?.click();
    if (action === "toggle-frame") {
      includeFrame = actionElement.checked;
      render();
    }
    if (action === "save-png") savePng();
  });

  app.addEventListener("keydown", (event) => {
    const row = event.target.closest('[data-action="select-message"]');
    if (!row || event.target !== row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectedId = row.dataset.id;
      render();
    }
  });

  app.addEventListener("input", (event) => {
    const bind = event.target.dataset.bind;
    if (!bind) return;
    const value = event.target.value;

    if (bind === "partnerName") setState((data) => ({ ...data, partnerName: value }));
    if (bind === "backgroundColor") setState((data) => ({ ...data, backgroundColor: normalizeColor(value) }));
    if (bind === "statusTime") setState((data) => ({ ...data, statusTime: normalizeTime(value) }));
    if (bind === "selectedText") updateSelected({ text: value });
    if (bind === "linkTitle") updateSelected({ linkTitle: value });
    if (bind === "linkDescription") updateSelected({ linkDescription: value });
    if (bind === "stickerText") updateSelected({ stickerText: value });
    if (bind === "stickerSize") updateSelected({ stickerSize: clampStickerSize(value) });
  });

  app.addEventListener("change", async (event) => {
    const target = event.target;
    const bind = target.dataset.bind;

    if (bind === "selectedKind") updateSelected(patchForKindChange(target.value));
    if (bind === "stickerSender") {
      updateSelected({ stickerSender: target.value === "self" ? "self" : "other" });
    }
    if (bind === "showLinkCard") updateSelected({ showLinkCard: target.checked });
    if (bind === "showPreviewPlayButton") updateSelected({ showPreviewPlayButton: target.checked });

    if (target.id === "partner-icon-input" && target.files?.[0]) {
      const dataUrl = await fileToDataUrl(target.files[0]);
      setState((data) => ({ ...data, partnerIcon: dataUrl }));
    }
    if (target.id === "background-input" && target.files?.[0]) {
      const dataUrl = await fileToDataUrl(target.files[0]);
      setState((data) => ({ ...data, backgroundImage: dataUrl }));
    }
    if (target.id === "thumbnail-input" && target.files?.[0]) {
      const dataUrl = await fileToDataUrl(target.files[0]);
      updateSelected({ thumbnailImage: dataUrl });
    }
    if (target.id === "sticker-input" && target.files?.[0]) {
      const dataUrl = await fileToDataUrl(target.files[0]);
      updateSelected({ stickerImage: dataUrl });
    }
    if (target.id === "json-input" && target.files?.[0]) {
      await importJson(target.files[0]);
    }
  });

  render();
})();
