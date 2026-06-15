import {
  Webhook,
  Clock,
  FileInput,
  GitBranch,
  Repeat,
  Code,
  Timer,
  Database,
  Mail,
  MessageSquare,
  Globe,
  Contact,
  CreditCard,
  Hash,
  Box,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Webhook,
  Clock,
  FileInput,
  GitBranch,
  Repeat,
  Code,
  Timer,
  Database,
  Mail,
  MessageSquare,
  Globe,
  Contact,
  CreditCard,
  Hash,
};

export function getIcon(name: string): LucideIcon {
  return MAP[name] ?? Box;
}
