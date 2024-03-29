import * as Dialog from "@radix-ui/react-dialog";
import { Ban, CheckCircle2, X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog open/close

  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);

    setContent("");

    setShouldShowOnboarding(true);

    toast.success("Nota criada com sucesso!");

    setIsDialogOpen(false); // Close dialog after saving
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravação! 😞");
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);
    setIsDialogOpen(true); // Open dialog when starting recording

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");
      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger className="relative flex flex-col gap-3 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-600 p-5 text-left outline-none transition hover:ring-2 hover:ring-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600">
        <span className="text-2xl font-medium text-slate-900 dark:text-zinc-100 md:text-lg">
          Adicionar nota
        </span>
        <p className="md:text-md text-xl leading-6 text-slate-700 dark:text-slate-300">
          Clique aqui para gravar uma nota em audio que será convertida em texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80">
          <Dialog.Content className="fixed inset-0 flex w-full flex-col overflow-hidden bg-slate-300 dark:bg-slate-700 outline-none md:inset-auto md:left-1/2 md:top-1/2 md:h-[60vh] md:max-w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
            <Dialog.Close
              className="absolute right-0 top-0 rounded-es bg-slate-600 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-slate-400 hover:text-slate-100"
              onClick={handleCloseDialog}
            >
              <X className="size-8" />
            </Dialog.Close>
            <form className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center gap-3 p-5 md:justify-start">
                <span className="text-3xl font-medium text-slate-900 dark:text-slate-300 md:text-lg">
                  Adicionar nota
                </span>
                {shouldShowOnboarding ? (
                  <p className="leading-12 text-2xl text-slate-700 dark:text-slate-400 md:text-lg md:leading-6">
                    Comece{" "}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="font-medium text-violet-600 dark:text-violet-400 hover:underline "
                    >
                      gravando uma nota
                    </button>{" "}
                    em audio ou{" "}
                    <button
                      type="button"
                      onClick={handleStartEditor}
                      className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      utilize apenas texto
                    </button>
                    .
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className="text-md flex-1 resize-none bg-transparent leading-6 text-slate-700 dark:text-slate-400 outline-none"
                    onChange={handleContentChanged}
                    value={content}
                  ></textarea>
                )}
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="text-md flex w-full items-center justify-center gap-2 bg-slate-600 dark:bg-slate-900 py-4 text-center text-2xl font-medium text-zinc-100 dark:text-slate-300 outline-none transition hover:text-red-500 hover:text-xl md:text-lg"
                >
                  <div className="size-3 animate-pulse rounded-full bg-red-600 dark:bg-red-500" />
                  Gravando <Ban className="w-4 text-red-600 dark:text-red-500" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="text-md flex w-full items-center justify-center gap-2 bg-slate-600 dark:bg-slate-900 py-4 text-center text-2xl font-medium text-zinc-100 outline-none transition hover:text-green-500 hover:text-xl md:text-lg"
                >
                  Salvar nota <CheckCircle2 className="w-4" />
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
