"use client";
import React from "react";
import ValueInput from "@/components/ValueInput";
import {
  BetCreatorProps,
  MessageState,
  Agent,
  SubmitResult,
} from "@/types/bet";
import MultiSelectDropdown, { MultiSelectOption } from "./MultiDropdown";
export default function BetCreator({
  agentVals,
  onSubmitBet,
  userAgentId,
}: BetCreatorProps) {

  const [agents, setAgents] = React.useState<number[]>([]);
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [message, setMessage] = React.useState<MessageState>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const dropdownAgents: MultiSelectOption<number>[] = agentVals.map(
    (agent) => ({
      label: agent.user_relation.username,
      value: agent.id,
    })
  );

  React.useEffect(() => {
    if (userAgentId) {
      const matchingAgent = agentVals.find((agent) => agent.id === userAgentId);
      if (matchingAgent) {
        setAgents([matchingAgent.id]);
      }
    }
  }, [userAgentId, agentVals]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    const result = await onSubmitBet({
      title,
      description,
      agentIds: agents,
    });

    setIsSubmitting(false);
    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTitle("");
      setDescription("");
      setAgents(userAgentId ? [userAgentId] : []);
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  return (
    <form className="shrink-0" onSubmit={handleSubmit}>
      <div className="p-6 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-xl font-medium text-gray-700">
            Title
          </label>
          <ValueInput
            name="title"
            value={title}
            onChange={setTitle}
            placeholder="Enter a short bet title..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xl font-medium text-gray-700">
            Description
          </label>
          <ValueInput
            name="description"
            value={description}
            onChange={setDescription}
            placeholder="Describe what the bet is about..."
            textarea
          />
        </div>
        <div className="space-y-4">
          <MultiSelectDropdown
            options={dropdownAgents}
            value={agents}
            onChange={setAgents}
            placeholder="Choose an agent..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 sm:px-5 py-2.5 bg-blue-600 active:bg-blue-700 sm:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md sm:hover:shadow-lg touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
