import { Input, Tooltip, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PaperPlaneRight } from "@phosphor-icons/react";
import clsx from "clsx";

interface StreamingAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: () => void;
  setInput: (value: string) => void;
  endContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function InteractiveAvatarTextInput({
  label,
  placeholder,
  input,
  onSubmit,
  setInput,
  endContent,
  disabled = false,
  loading = false,
}: StreamingAvatarTextInputProps) {
  function handleSubmit() {
    if (input.trim() === "") {
      return;
    }
    onSubmit();
    setInput("");
  }

  return (
    <div className="flex flex-col w-full px-2 pb-2">

      {label && <label className="mb-2 block text-white">{label}</label>}
      <Input
        className="flex px-4 py-2 bg-gray-800 focus:ring-indigo-500"
        placeholder={placeholder}
        value={input}
        size="large"
        disabled={disabled}
        suffix={
          <div className="flex flex-row items-center">
            {endContent}
            <Tooltip title="Send message">
              {loading ? (
                <Spin
                  indicator={
                    <LoadingOutlined style={{ fontSize: 24, color: "#1890ff" }} spin />
                  }
                />
              ) : (
                <button
                  type="submit"
                  className="focus:outline-none"
                  onClick={handleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                >
                  <PaperPlaneRight
                    className={clsx(
                      "text-indigo-300 hover:text-indigo-200",
                      disabled && "opacity-50"
                    )}
                    size={24}
                  />
                </button>
              )}
            </Tooltip>
          </div>
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}
