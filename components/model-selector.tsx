"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const models = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude-3.5", name: "Claude 3.5" },
  { id: "grok-ai", name: "Grok AI" },
  { id: "gemini-3.5", name: "Gemini 3.5" },
];

export function ModelSelector({
  onModelChange,
}: {
  onModelChange?: (model: string) => void;
}) {
  return (
    <Select onValueChange={onModelChange} defaultValue="gpt-4">
      <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
