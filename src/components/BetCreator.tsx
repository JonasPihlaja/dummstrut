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
import SingleSelectDropdown, { SingleSelectOption } from "./Dropdown";
import FileInput from "@/components/FileInput";
import { compressVideo } from "@/lib/videoCompression";

export default function BetCreator({
  seasonVals,
  agentVals,
  onSubmitBet,
  userAgentId,
}: BetCreatorProps) {
  const [agents, setAgents] = React.useState<number[]>([]);
  const [season, setSeason] = React.useState<number>(seasonVals[0]?.id ?? 0);
  const [title, setTitle] = React.useState<string>("");
  const [video, setVideo] = React.useState<File | null>(null);
  const [description, setDescription] = React.useState<string>("");
  const [message, setMessage] = React.useState<MessageState>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isCompressing, setIsCompressing] = React.useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = React.useState<number>(0);

  const dropdownAgents: MultiSelectOption<number>[] = agentVals.map(
    (agent) => ({
      label: agent.user_relation.username,
      value: agent.id,
    })
  );

  const dropdownSeasons: SingleSelectOption<number>[] = seasonVals.map(
    (season) => ({
      label: season.title ? season.title + " " + season.year.toString() : "",
      value: season.id,
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

    let videoToSubmit = video;

    // Compress video if provided
    if (video) {
      try {
        setIsCompressing(true);
        setCompressionProgress(0);
        videoToSubmit = await compressVideo(video, (progress) => {
          setCompressionProgress(progress);
        });
        setIsCompressing(false);
        setCompressionProgress(0);
      } catch (error) {
        setIsCompressing(false);
        setCompressionProgress(0);
        setMessage({
          type: "error",
          text: `Failed to compress video: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        setIsSubmitting(false);
        return;
      }
    }

    const result = await onSubmitBet({
      title,
      description,
      agentIds: agents,
      season,
      video: videoToSubmit,
    });

    setIsSubmitting(false);
    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setTitle("");
      setDescription("");
      setVideo(null);
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
        <div className="space-y-4">
          <SingleSelectDropdown
            options={dropdownSeasons}
            value={season}
            onChange={setSeason}
            placeholder="Choose a season..."
          />
        </div>

        <div className="space-y-4">
          <FileInput value={video} onChange={setVideo} accept="video/*" placeholder="No video selected" />
          {isCompressing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  Compressing video... {compressionProgress}%
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isCompressing}
          className="px-4 sm:px-5 py-2.5 bg-blue-600 active:bg-blue-700 sm:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md sm:hover:shadow-lg touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompressing ? `Compressing... ${compressionProgress}%` : isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
