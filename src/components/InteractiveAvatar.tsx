import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { Card, CardBody, CardFooter, Chip } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import { AVATARS, STT_LANGUAGE_LIST } from "../lib/constants";
import { createStreamingToken } from "../api/heygen";
import { Input, Select, Divider, Button, Spin, Segmented } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await createStreamingToken();
      const token = response;

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
  
    const newToken = await fetchAccessToken();
  
    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeId: knowledgeId,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
        disableIdleTimeout: true,
      });
  
      setData(res);
  
      // Instead of automatically switching to voice mode,
      // only start voice chat if the current mode is already voice_mode.
      if (chatMode === "voice_mode") {
        await avatar.current?.startVoiceChat({ useSilencePrompt: false });
      } else {
        // Otherwise, ensure that any active voice chat is closed.
        avatar.current?.closeVoiceChat();
      }
      // Do not force setChatMode here—preserve the current mode.
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }
  
  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }

    await avatar.current
      .speak({ text: text, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
      .catch((e) => {
        setDebug(e.message);
      });
    setIsLoadingRepeat(false);
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    if (v === "text_mode") {
      avatar.current?.closeVoiceChat();
    } else {
      await avatar.current?.startVoiceChat({});
    }
    setChatMode(v);
  });

  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    if (chatMode === "voice_mode") {
      if (!previousText && text) {
        avatar.current?.startListening();
      } else if (previousText && !text) {
        avatar.current?.stopListening();
      }
    }
  }, [text, previousText, chatMode]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card
        className="rounded-lg"
        style={{
          backgroundColor: "#18181b",
        }}
      >
        <CardBody className="h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="middle"
                  variant="filled"
                  onClick={handleInterrupt}
                >
                  Interrupt task
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300  text-white rounded-lg"
                  size="middle"
                  variant="filled"
                  onClick={endSession}
                >
                  End session
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-2">
                  <h3 className="text-white">
                    {"Custom Knowledge ID(optional)"}
                  </h3>
                  <Input
                    placeholder="Enter a custom knowledge ID"
                    value={knowledgeId}
                    onChange={(e) => setKnowledgeId(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-white">{"Custom Avatar ID(optional)"}</h3>
                  <Input
                    placeholder="Enter a custom avatar ID"
                    value={avatarId}
                    onChange={(e) => setAvatarId(e.target.value)}
                  />
                </div>

                <Divider orientationMargin="0">or</Divider>
                <Select
                  // label="Or select one from these example avatars"

                  placeholder="select one from these example avatars"
                  onChange={(value: string) => {
                    setAvatarId(value);
                  }}
                >
                  {AVATARS.map((avatar) => (
                    <Select.Option value={avatar.avatar_id}>
                      {avatar.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Select language"
                  // className="max-w-xs"
                  onChange={(value: string) => {
                    setLanguage(value);
                  }}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <Select.Option key={lang.key} value={lang.value}>
                      {lang.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Button
                className="p-5 w-full text-white"
                size="middle"
                variant="filled"
                type="default"
                loading={isLoadingSession}
                onClick={startSession}
              >
                Start session
              </Button>
            </div>
          ) : (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 relative">
          <Segmented
            aria-label="Options"
            value={chatMode}
            onChange={(v) => {
              handleChangeChatMode(v);
            }}
            options={[
              { value: "text_mode", label: "Text mode" },
              { value: "voice_mode", label: "Voice mode" },
            ]}
          ></Segmented>

          {chatMode === "text_mode" ? (
            <div className="w-full flex flex-row relative">
              <InteractiveAvatarTextInput
                disabled={!stream}
                input={text}
                label="Chat:"
                loading={isLoadingRepeat}
                placeholder="Type something for the avatar to respond"
                setInput={setText}
                onSubmit={handleSpeak}
              />
              {text && (
                <Chip className="absolute right-16 top-3">Listening</Chip>
              )}
            </div>
          ) : (
            <div className="w-full text-center">
              <Button
                disabled={!isUserTalking}
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white"
                size="middle"
                variant="filled"
              >
                {isUserTalking ? "Listening" : "Voice chat"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="font-mono text-right text-sm text-gray-400">
        <span className="font-bold text-white">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}
