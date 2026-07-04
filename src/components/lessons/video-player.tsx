"use client";

import { useEffect, useRef, useState } from "react";
import { saveProgressAction } from "@/actions/progress";
import { Button } from "@/components/ui/button";

export function VideoPlayer({
  lessonId,
  title,
  initialPosition,
  completed
}: {
  lessonId: string;
  title: string;
  initialPosition: number;
  completed: boolean;
}) {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const lastSave = useRef(initialPosition);

  useEffect(() => {
    fetch(`/api/video-access/${lessonId}`)
      .then((response) => response.json())
      .then((data) => {
        setIframeUrl(data.iframeUrl ?? "");
        setWarning(data.warning ?? "");
      })
      .catch(() => setWarning("Nao foi possivel carregar o acesso ao video."));
  }, [lessonId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      lastSave.current += 30;
      const form = new FormData();
      form.set("lesson_id", lessonId);
      form.set("last_position_seconds", String(lastSave.current));
      form.set("is_completed", "false");
      void saveProgressAction(form);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [lessonId]);

  async function complete() {
    const form = new FormData();
    form.set("lesson_id", lessonId);
    form.set("last_position_seconds", String(lastSave.current));
    form.set("is_completed", "true");
    await saveProgressAction(form);
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Carregando video...</div>
        )}
      </div>
      {warning ? <p className="text-sm text-muted-foreground">{warning}</p> : null}
      <Button onClick={complete} variant={completed ? "secondary" : "default"}>
        {completed ? "Aula concluida" : "Marcar como concluida"}
      </Button>
    </div>
  );
}
