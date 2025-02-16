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
  
      if (chatMode === "voice_mode") {
        await avatar.current?.startVoiceChat({ useSilencePrompt: false });
      } else {
        avatar.current?.closeVoiceChat();
      }
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
      .speak({ text: text, taskType: TaskType.TALK, taskMode: TaskMode.SYNC })
      .catch((e) => {
        setDebug(e.message);
      });

      // await avatar.current
      // .speak({ text: text, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC })
      // .catch((e) => {
      //   setDebug(e.message);
      // });

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
      <Card className="rounded-lg" style={{ backgroundColor: "#18181b" }}>
        <CardBody className="h-[500px] sm:h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="w-full h-full flex justify-center items-center rounded-lg overflow-hidden relative">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                <track kind="captions" />
              </video>
              <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="middle"
                  variant="filled"
                  onClick={handleInterrupt}
                >
                  Interrupt task
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="middle"
                  variant="filled"
                  onClick={endSession}
                >
                  End session
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="w-full max-w-[500px] flex flex-col gap-8 items-center justify-center mx-auto">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-2">
                  <h3 className="text-white">Custom Knowledge ID(optional)</h3>
                  <Input
                    placeholder="Enter a custom knowledge ID"
                    value={knowledgeId}
                    onChange={(e) => setKnowledgeId(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white">Custom Avatar ID(optional)</h3>
                  <Input
                    placeholder="Enter a custom avatar ID"
                    value={avatarId}
                    onChange={(e) => setAvatarId(e.target.value)}
                  />
                </div>
                <Divider orientationMargin="0">or</Divider>
                <Select
                  placeholder="select one from these example avatars"
                  onChange={(value: string) => setAvatarId(value)}
                >
                  {AVATARS.map((avatar) => (
                    <Select.Option key={avatar.avatar_id} value={avatar.avatar_id}>
                      {avatar.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Select language"
                  onChange={(value: string) => setLanguage(value)}
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
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 relative">
          <Segmented
            aria-label="Options"
            value={chatMode}
            onChange={(v) => handleChangeChatMode(v)}
            options={[
              { value: "text_mode", label: "Text mode" },
              { value: "voice_mode", label: "Voice mode" },
            ]}
          />
          {chatMode === "text_mode" ? (
            <div className="w-full flex flex-col sm:flex-row relative mt-4">
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
                <Chip className="mt-2 sm:mt-0 sm:absolute sm:right-16 sm:top-3">
                  Listening
                </Chip>
              )}
            </div>
          ) : (
            <div className="w-full text-center mt-4">
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
