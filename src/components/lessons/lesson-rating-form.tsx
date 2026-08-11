"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { saveLessonRatingAction } from "@/actions/lesson-interactions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function LessonRatingForm({
  lessonId,
  path,
  averageRating,
  ratingsCount,
  initialRating,
  initialFeedback
}: {
  lessonId: string;
  path: string;
  averageRating: number | null;
  ratingsCount: number;
  initialRating: number | null;
  initialFeedback: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(nextRating: number, nextFeedback = feedback) {
    setRating(nextRating);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("lesson_id", lessonId);
      formData.set("rating", String(nextRating));
      formData.set("feedback", nextFeedback);
      formData.set("path", path);
      await saveLessonRatingAction(formData);
      setMessage("Avaliacao salva.");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" aria-label="Avaliar aula de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => submit(value)}
              className="rounded-md p-1 text-primary transition hover:bg-muted disabled:opacity-60"
              disabled={pending}
              aria-label={`Avaliar com ${value} estrela${value > 1 ? "s" : ""}`}
            >
              <Star className={`h-6 w-6 ${value <= rating ? "fill-primary" : ""}`} aria-hidden />
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Média: <span className="font-semibold text-foreground">{averageRating ? averageRating.toFixed(1) : "Sem avaliações"}</span>
          {ratingsCount ? ` (${ratingsCount})` : ""}
        </p>
      </div>
      <Textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        placeholder="Feedback opcional para os administradores"
        rows={4}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={pending || rating === 0} onClick={() => submit(rating, feedback)}>
          {pending ? "Salvando..." : "Salvar feedback"}
        </Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </div>
    </div>
  );
}
