import { DrivoDestination } from "./types";

export type AdvisorSeverity = "warning" | "tip";

export interface AdvisorMessage {
  id: string;
  text: string;
  severity: AdvisorSeverity;
  createdAt: number;
  /** Set only for stop-triggered messages; lets DrivoApp drop the message if this stop is later removed. */
  sourceDestId?: string;
}

interface CategoryRule {
  matches: string[];
  severity: AdvisorSeverity;
  template: (name: string) => string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    matches: ["nhà hàng", "quán ăn", "ăn uống"],
    severity: "warning",
    template: (name) => `${name} thường đông vào giờ cao điểm — cân nhắc ghé trước 11:30 hoặc sau 13:30.`,
  },
  {
    matches: ["quán cà phê", "cafe", "coffee"],
    severity: "warning",
    template: (name) => `${name} có thể đông khách cuối tuần — dự phòng thêm ~20 phút cho chặng này.`,
  },
  {
    matches: ["điểm tham quan", "check-in", "thác", "đồi"],
    severity: "warning",
    template: (name) => `${name} là điểm ngoài trời — khả năng mưa chiều ở khu vực này khá cao, nên đi buổi sáng.`,
  },
  {
    matches: ["cây xăng", "trạm xăng", "trạm dừng chân"],
    severity: "tip",
    template: (name) => `Đã thêm ${name} — nhớ đổ đầy bình trước đoạn đèo dài.`,
  },
];

const DEFAULT_STOP_TEMPLATE = "Đã thêm điểm dừng mới. Kiểm tra lại thứ tự các điểm để tránh đi vòng.";

function truncateName(s: string, max = 60): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function generateId(): string {
  return `adv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function matchCategoryRule(category: string): CategoryRule | undefined {
  const normalized = category.toLowerCase();
  return CATEGORY_RULES.find((rule) => rule.matches.some((m) => normalized.includes(m)));
}

export function buildStopAdvisorMessage(dest: DrivoDestination): AdvisorMessage {
  const name = truncateName(dest.name);
  const rule = matchCategoryRule(dest.category ?? "");
  return {
    id: generateId(),
    text: rule ? rule.template(name) : DEFAULT_STOP_TEMPLATE,
    severity: rule ? rule.severity : "tip",
    createdAt: Date.now(),
    sourceDestId: dest.id,
  };
}

export function buildTrackAdvisorMessage(trackName: string): AdvisorMessage {
  const name = truncateName(trackName);
  return {
    id: generateId(),
    text: `Vừa tạo ${name}. Chọn điểm cuối chặng rồi thêm 1-2 điểm dừng để hành trình bớt mệt.`,
    severity: "tip",
    createdAt: Date.now(),
  };
}

export function formatRelativeTime(createdAt: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - createdAt) / 1000));
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} giờ trước`;
}
