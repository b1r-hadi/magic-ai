import { useState, useEffect,useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Upload,
  MessageCircle,
  Send,
  X,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import wizardMascot from "@/assets/wizard-mascot.png";



interface PresentationData {
  slides: any;
  script: string;
  voiceStyle: string;
  fileName: string;
  totalSlides: number;
}



const PresentationPage = () => {
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<Array<{ id: string, question: string, answer: string, timestamp: Date }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState("Welcome to your magical presentation! Click play to begin.");
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('presentationData');
    console.log("Loaded presentation data:", data);
    if (data) {
      setPresentationData(JSON.parse(data));

    } else {
      toast({
        title: "No presentation data found",
        description: "Please upload your presentation first",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [navigate, toast]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentSubtitle(`Playing slide ${currentSlide} of ${presentationData?.totalSlides || 5}...`);
    } else {
      setCurrentSubtitle("Presentation paused. Click play to continue.");
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < (presentationData?.totalSlides || 5)) {
      setCurrentSlide(currentSlide + 1);
      setCurrentSubtitle(`Now showing slide ${currentSlide + 1}`);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
      setCurrentSubtitle(`Back to slide ${currentSlide - 1}`);
    }
  };

  const handleRestart = () => {
    setCurrentSlide(1);
    setIsPlaying(false);
    setCurrentSubtitle("Presentation restarted. Ready to begin from the first slide.");
  };

  const handleNewPresentation = () => {
    localStorage.removeItem('presentationData');
    navigate("/");
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const newQuestion = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: "",
      timestamp: new Date()
    };

    setQaHistory(prev => [...prev, newQuestion]);
    setQuestion("");
    setIsTyping(true);

    // API call to n8n Q&A endpoint
    try {
      const response = await fetch("https://bot.csautomaition.com/webhook/qa-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          context: presentationData?.script || "" // Send the presentation script as context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();
      const answer = data.output || "Sorry was not able to generate response at the moment";
      // console.log("Received answer:", data.output);

      // Update QA history with answer
      setQaHistory(prev =>
        prev.map(qa =>
          qa.id === newQuestion.id
            ? { ...qa, answer }
            : qa
        )
      );
    } catch (error) {
      toast({
        title: "Failed to get answer",
        description: "Please try your question again",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };
useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.load(); // reload current slide audio

    if (isPlaying) {
      audioRef.current
        .play()
        .catch((err) => console.log("Playback error:", err));
      setCurrentSubtitle(`Playing slide ${currentSlide} of ${presentationData?.totalSlides || 5}...`);
    } else {
      audioRef.current.pause();
      setCurrentSubtitle("Presentation paused. Click play to continue.");
    }
  }, [currentSlide, isPlaying, presentationData]);
  if (!presentationData) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header with Progress */}
      <div className="border-b border-border/10 bg-background/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                Slide {currentSlide} of {presentationData.totalSlides}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Voice: {presentationData.voiceStyle} | File: {presentationData.fileName}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleNewPresentation}
              className="border-border hover:shadow-glow transition-magical"
            >
              <Upload className="w-4 h-4 mr-2" />
              New Presentation
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-200px)]">
          {/* Left Panel - Wizard */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 gradient-card shadow-card border-0">
              <div className="text-center space-y-4">
                <div className="relative">
                  <img
                    src={wizardMascot}
                    alt="AI Wizard"
                    className="w-full max-w-xs mx-auto animate-float"
                  />
                  {isPlaying && (
                    <div className="absolute top-4 right-4">
                      <Volume2 className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Your AI Presenter
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isPlaying ? "Currently presenting..." : "Ready to present when you are!"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Controls */}
            <Card className="p-6 gradient-card shadow-card border-0">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Presentation Controls</h4>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayPause}
                    className="flex-1 gradient-magical border-0 shadow-magical hover:shadow-glow transition-magical"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handlePrevSlide}
                    variant="outline"
                    disabled={currentSlide === 1}
                    className="border-border hover:shadow-glow transition-magical"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleNextSlide}
                    variant="outline"
                    disabled={currentSlide === presentationData.totalSlides}
                    className="border-border hover:shadow-glow transition-magical"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="border-border hover:shadow-glow transition-magical"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {presentationData.slides[currentSlide - 1] && (
              <Card className="aspect-video gradient-card shadow-card border-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-background/50">
                  <div className="text-center space-y-4">
                    <img
                      src={presentationData.slides[currentSlide - 1].slideUrl}
                      alt={`Slide ${currentSlide}`}
                      className="max-w-full max-h-full object-contain"
                    />
                     <audio
                    ref={audioRef}
                    src={presentationData.slides[currentSlide - 1].audioUrl}
                    onEnded={handleNextSlide}
                  />
                  </div>
                </div>
              </Card>
            )}


            {/* Subtitles */}
            // <Card className="p-4 bg-black/80 backdrop-blur-sm border-0">
            //   <p className="text-white text-center text-lg leading-relaxed">
            //     {currentSubtitle}
            //   </p>
            // </Card>
          </div>
        </div>

        {/* Q&A Panel Toggle */}
        <Button
          onClick={() => setShowQA(!showQA)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 gradient-magical border-0 shadow-magical hover:shadow-glow transition-magical"
        >
          {showQA ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>

        {/* Q&A Panel */}
        {showQA && (
          <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] gradient-card shadow-magical border-0 max-h-96 flex flex-col">
            <div className="p-4 border-b border-border/20">
              <h4 className="font-semibold text-foreground">Live Q&A</h4>
              <p className="text-sm text-muted-foreground">Ask questions about the presentation</p>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-48">
              {qaHistory.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">
                  No questions yet. Ask something!
                </p>
              ) : (
                qaHistory.map((qa) => (
                  <div key={qa.id} className="space-y-2">
                    <div className="bg-primary/10 rounded-lg p-3 ml-8">
                      <p className="text-sm">{qa.question}</p>
                    </div>
                    {qa.answer ? (
                      <div className="bg-accent/10 rounded-lg p-3 mr-8">
                        <p className="text-sm">{qa.answer}</p>
                      </div>
                    ) : (
                      <div className="bg-accent/10 rounded-lg p-3 mr-8">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  disabled={isTyping}
                  className="border-border"
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isTyping}
                  className="gradient-magical border-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PresentationPage;
