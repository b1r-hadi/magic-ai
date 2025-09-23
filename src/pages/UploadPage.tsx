import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import wizardMascot from "@/assets/wizard-mascot.png";

const UploadPage = () => {
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!script.trim()) {
      toast({
        title: "Script required",
        description: "Please enter your presentation script",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "PDF required",
        description: "Please upload your presentation slides",
        variant: "destructive",
      });
      return;
    }

    if (!voiceStyle) {
      toast({
        title: "Voice style required",
        description: "Please select a voice style",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 🔗 Call your n8n webhook here
      const formData = new FormData();
      formData.append("script", script);
      formData.append("voiceStyle", voiceStyle);
      formData.append("file", file);

      const response = await fetch("https://bot.csautomaition.com/webhook/start-presentation", {
        method: "POST",
        body: formData,
      });
      console.log("Form Data Sent:" + formData || "No data"); // findEdit
      if (!response.ok) {
        throw new Error("Failed to call n8n webhook");
      }

      const data = await response.json();
 
      // Store response from n8n for the presentation page
      localStorage.setItem("presentationData", JSON.stringify({
        script,
        voiceStyle,
        slides: data,
        totalSlides: data.totalSlides,
      }));

      console.log("Response from upload page n8n:", data); // findEdit
      toast({
        title: "✨ Presentation ready!",
        description: "Your magical presentation has been prepared",
      });

      navigate("/presentation");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to prepare your presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Hero with Wizard */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                AI Wizard
                <span className="block gradient-magical bg-clip-text text-transparent">
                  Presenter
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Transform your slides into magical presentations with AI narration and interactive features
              </p>
            </div>

            <div className="relative">
              <img
                src={wizardMascot}
                alt="AI Wizard Mascot"
                className="w-full -ml-5 max-w-md mx-auto rounded-lg shadow-lg animate-float"
              />
              <div className="absolute inset-0 animate-glow opacity-30"></div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-medium">Powered by Magic & AI</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Right side - Upload Form */}
          <div className="w-full max-w-lg mx-auto">
            <Card className="p-8 gradient-card shadow-magical border-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <Wand2 className="w-8 h-8 mx-auto text-primary animate-glow" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Setup Your Presentation
                  </h2>
                  <p className="text-muted-foreground">
                    Let's create some presentation magic
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="script" className="text-base font-medium">
                    Presentation Script
                  </Label>
                  <Textarea
                    id="script"
                    placeholder="Enter your presentation script here..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="min-h-32 border-border transition-magical focus:shadow-glow"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slides" className="text-base font-medium">
                    Upload PDF Slides
                  </Label>
                  <div className="relative">
                    <Input
                      id="slides"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="slides"
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-magical hover:shadow-glow bg-background/50"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {file ? file.name : "Click to upload PDF slides"}
                      </span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice" className="text-base font-medium">
                    Voice Style
                  </Label>
                  <Select onValueChange={setVoiceStyle} disabled={isLoading}>
                    <SelectTrigger className="border-border transition-magical focus:shadow-glow">
                      <SelectValue placeholder="Choose your wizard's voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="storyteller">Storyteller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-medium gradient-magical border-0 shadow-magical hover:shadow-glow transition-magical"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing your magical presentation...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Presentation
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
