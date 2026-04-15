import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, TrendingUp, DollarSign, Target, Users } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "goals" | "org" | "insights">("overview");
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // tRPC queries
  const chatMutation = trpc.jarvis.chat.useMutation();
  const conversationsQuery = trpc.jarvis.conversations.useQuery();
  const metricsQuery = trpc.wealth.metrics.useQuery();
  const goalsQuery = trpc.wealth.goals.useQuery({ status: undefined });
  const tasksQuery = trpc.wealth.tasks.useQuery({ status: undefined });
  const orgQuery = trpc.wealth.orgStructure.useQuery();
  const insightsQuery = trpc.wealth.insights.useQuery();
  const briefingQuery = trpc.wealth.briefing.useQuery();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await chatMutation.mutateAsync({
        message: message.trim(),
        conversationId: conversationId || undefined,
      });

      setConversationId(response.conversationId);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Welcome, Chairman</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Your personal wealth command center powered by Jarvis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {(["overview", "chat", "goals", "org", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metricsQuery.data?.map((metric) => (
              <Card key={metric.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {metric.metricType.replace(/_/g, " ").toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${metric.value.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      <TrendingUp size={16} />
                      <span className="text-sm">{metric.percentageChange}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Insights */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Recent Insights from Jarvis</CardTitle>
              <CardDescription>Latest strategic recommendations and opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsQuery.data?.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{insight.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{insight.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Latest Briefing */}
          {briefingQuery.data && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>{briefingQuery.data.title}</CardTitle>
                <CardDescription>Generated by Jarvis for your flow state</CardDescription>
              </CardHeader>
              <CardContent>
                <Streamdown>{briefingQuery.data.content as any}</Streamdown>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat with Jarvis</CardTitle>
            <CardDescription>Your AI wealth strategist and executive assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
            {/* Messages would go here */}
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              Start a conversation with Jarvis to get wealth strategy advice
            </div>
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <Input
              placeholder="Ask Jarvis anything about your wealth strategy..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
        </Card>
      )}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Wealth-Building Goals</h2>
            <Button className="bg-amber-600 hover:bg-amber-700">Create Goal</Button>
          </div>
          {goalsQuery.data?.map((goal) => (
            <Card key={goal.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{goal.title}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    goal.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Progress</p>
                    <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{
                          width: goal.targetValue
                            ? `${(parseFloat(goal.currentValue as any) / parseFloat(goal.targetValue as any)) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Target</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">${goal.targetValue?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Org Structure Tab */}
      {activeTab === "org" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Conglomerate Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {["chairman", "board", "c_suite", "manager", "worker"].map((role) => {
              const roleMembers = orgQuery.data?.filter((org) => org.role === role) || [];
              return (
                <Card key={role} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{role.replace(/_/g, " ").toUpperCase()}</CardTitle>
                    <CardDescription>{roleMembers.length} member(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {roleMembers.map((member) => (
                      <div key={member.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <p className="font-medium text-sm">{member.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{member.department}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Strategic Insights</h2>
          {insightsQuery.data?.map((insight) => (
            <Card key={insight.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{insight.title}</CardTitle>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    {insight.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Streamdown>{insight.content as any}</Streamdown>
                {insight.actionItems ? (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-sm mb-2">Action Items:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {(insight.actionItems as any[])?.map((item: any, idx: number) => (
                        <li key={idx}>{String(item)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
