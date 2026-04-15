import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useTTS } from "@/hooks/useTTS";
import { Streamdown } from "streamdown";
import { Send, Volume2, VolumeX, Zap, Target, Users, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Single-page dark-themed dashboard with all content in one scrollable view
 * Includes: Chat, Metrics, Goals, Org-Chart, Insights
 */

export default function DashboardSinglePage() {
  const { user, loading } = useAuth();
  const { speak, stop, isPlaying } = useTTS({ accent: "british" });
  const [chatMessage, setChatMessage] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalPriority, setGoalPriority] = useState("High");

  // API queries
  const conversationsQuery = trpc.jarvis.conversations.useQuery();
  const goalsQuery = trpc.wealth.goals.useQuery({ status: undefined });
  const metricsQuery = trpc.wealth.metrics.useQuery();
  const orgStructureQuery = trpc.wealth.orgStructure.useQuery();
  const insightsQuery = trpc.wealth.insights.useQuery();

  // API mutations
  const chatMutation = trpc.jarvis.chat.useMutation();
  const createGoalMutation = trpc.wealth.createGoal.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your command center...</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const message = chatMessage;
    setChatMessage("");

    try {
      const response = await chatMutation.mutateAsync({ message });
      toast.success("Jarvis received your message");

      // Show response text
      toast.message("Jarvis", {
        description: response.message.substring(0, 100) + "...",
      });
    } catch (error) {
      toast.error("Failed to send message to Jarvis");
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    try {
      await createGoalMutation.mutateAsync({
        title: goalTitle,
        description: goalDescription,
        priority: goalPriority,
      });

      setGoalTitle("");
      setGoalDescription("");
      setGoalPriority("High");
      goalsQuery.refetch();
      toast.success("Goal created successfully");
    } catch (error) {
      toast.error("Failed to create goal");
    }
  };

  const handleSpeak = (text: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Jarvis Command Center</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome, {user?.name || "Chairman"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-slate-300 text-sm font-medium">{user?.email}</p>
              <p className="text-slate-500 text-xs">Owner • Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Section 1: Chat with Jarvis */}
        <section className="scroll-mt-20" id="chat">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <div>
                  <CardTitle className="text-white">Chat with Jarvis</CardTitle>
                  <CardDescription>Your AI wealth strategist and butler</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Chat messages display */}
              <div className="bg-slate-950 rounded-lg p-4 mb-4 h-64 overflow-y-auto border border-slate-800">
                {conversationsQuery.data && conversationsQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {conversationsQuery.data.map((conv, idx) => (
                      <div key={idx} className="text-sm text-slate-300">
                        <p className="text-blue-400 font-semibold">You:</p>
                        <p className="text-slate-400 ml-2">Last conversation: {conv.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-20">
                    Start a conversation with Jarvis...
                  </p>
                )}
              </div>

              {/* Input area */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Jarvis anything about your wealth strategy..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={chatMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Wealth Metrics */}
        <section className="scroll-mt-20" id="metrics">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-400" />
                <div>
                  <CardTitle className="text-white">Wealth Metrics</CardTitle>
                  <CardDescription>Your financial KPIs at a glance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {metricsQuery.isLoading ? (
                <p className="text-slate-400">Loading metrics...</p>
              ) : metricsQuery.data && metricsQuery.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metricsQuery.data.map((metric, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                    >
                      <p className="text-slate-400 text-sm font-medium">{metric.name}</p>
                      <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{metric.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No metrics yet. Create your first wealth goal below.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Goals & Tasks */}
        <section className="scroll-mt-20" id="goals">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-yellow-400" />
                <div>
                  <CardTitle className="text-white">Wealth Goals</CardTitle>
                  <CardDescription>Your strategic objectives</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Create goal form */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
                <h3 className="text-white font-semibold mb-4">Create New Goal</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Goal title (e.g., Build $1M Emergency Fund)"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 h-20"
                  />
                  <div className="flex gap-2">
                    <select
                      value={goalPriority}
                      onChange={(e) => setGoalPriority(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded px-3 py-2"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <Button
                      onClick={handleCreateGoal}
                      disabled={createGoalMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Create Goal
                    </Button>
                  </div>
                </div>
              </div>

              {/* Goals list */}
              {goalsQuery.isLoading ? (
                <p className="text-slate-400">Loading goals...</p>
              ) : goalsQuery.data && goalsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {goalsQuery.data.map((goal, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{goal.title}</p>
                          <p className="text-slate-400 text-sm mt-1">{goal.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                              {goal.priority}
                            </span>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                              {goal.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No goals yet. Create your first goal above.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Org Structure */}
        <section className="scroll-mt-20" id="org">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <CardTitle className="text-white">Conglomerate Structure</CardTitle>
                  <CardDescription>Your organizational hierarchy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {orgStructureQuery.isLoading ? (
                <p className="text-slate-400">Loading org structure...</p>
              ) : orgStructureQuery.data && orgStructureQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {orgStructureQuery.data.map((member, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                    >
                      <p className="text-white font-semibold">{member.role}</p>
                      <p className="text-slate-400 text-sm">{member.department}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  Org structure initializing...
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Strategic Insights */}
        <section className="scroll-mt-20" id="insights">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <div>
                  <CardTitle className="text-white">Strategic Insights</CardTitle>
                  <CardDescription>Jarvis's recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {insightsQuery.isLoading ? (
                <p className="text-slate-400">Loading insights...</p>
              ) : insightsQuery.data && insightsQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {insightsQuery.data.map((insight, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-semibold">{insight.title}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSpeak(insight.content)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                        >
                          {isPlaying ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Streamdown>{insight.content as any}</Streamdown>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No insights yet. Chat with Jarvis to get recommendations.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Jarvis Conglomerate Dashboard • Powered by Groq Llama 3.3 70B
          </p>
          <p className="text-slate-600 text-xs mt-2">
            All conversations are encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  );
}
