import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare, Plus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Event = {
  event_id: number;
  name: string;
  date: string;
  time: string;
};

type Student = {
  student_id: number;
  name: string;
  roll_number: string;
};

type FeedbackRecord = {
  feedback_id: number;
  event_id: number;
  student_id: number;
  rating: number;
  comments: string;
  student: Student;
  event: Event;
};

const Feedback = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newFeedback, setNewFeedback] = useState({
    event_id: "",
    student_id: "",
    rating: 0,
    comments: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchStudents();
    fetchFeedback();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("event_id, name, date, time")
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("student_id, name, roll_number")
        .order("name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          feedback_id,
          event_id,
          student_id,
          rating,
          comments,
          students:student_id (
            student_id,
            name,
            roll_number
          ),
          events:event_id (
            event_id,
            name,
            date,
            time
          )
        `)
        .order("feedback_id", { ascending: false });

      if (error) throw error;

      // Transform the data to match our type
      const transformedFeedback = data?.map(fb => ({
        feedback_id: fb.feedback_id,
        event_id: fb.event_id,
        student_id: fb.student_id,
        rating: fb.rating,
        comments: fb.comments,
        student: Array.isArray(fb.students) ? fb.students[0] : fb.students,
        event: Array.isArray(fb.events) ? fb.events[0] : fb.events
      })) || [];

      setFeedback(transformedFeedback);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("feedback").insert([
        {
          event_id: parseInt(newFeedback.event_id),
          student_id: parseInt(newFeedback.student_id),
          rating: newFeedback.rating,
          comments: newFeedback.comments,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });

      setIsCreateOpen(false);
      setNewFeedback({
        event_id: "",
        student_id: "",
        rating: 0,
        comments: "",
      });
      fetchFeedback();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Feedback</h1>
          <p className="text-muted-foreground">Collect and manage feedback from students</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>
                Provide feedback for an event experience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <Label htmlFor="event">Event</Label>
                <Select
                  value={newFeedback.event_id}
                  onValueChange={(value) => setNewFeedback({ ...newFeedback, event_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.event_id} value={event.event_id.toString()}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student">Student</Label>
                <Select
                  value={newFeedback.student_id}
                  onValueChange={(value) => setNewFeedback({ ...newFeedback, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.student_id} value={student.student_id.toString()}>
                        {student.name} ({student.roll_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="mt-2">
                  {renderStars(newFeedback.rating, true, (rating) =>
                    setNewFeedback({ ...newFeedback, rating })
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={newFeedback.comments}
                  onChange={(e) => setNewFeedback({ ...newFeedback, comments: e.target.value })}
                  placeholder="Share your thoughts about the event..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Feedback
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{feedback.length}</div>
            <p className="text-xs text-muted-foreground">Responses collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{getAverageRating()}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Reviewed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(feedback.map(fb => fb.event_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique events</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest feedback submissions from students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.map((fb) => (
              <div key={fb.feedback_id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{fb.event?.name || "Unknown Event"}</h4>
                    <p className="text-sm text-muted-foreground">
                      By {fb.student?.name || "Unknown Student"} ({fb.student?.roll_number || "N/A"})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStars(fb.rating)}
                    <span className="text-sm text-muted-foreground">{fb.rating}/5</span>
                  </div>
                </div>
                {fb.comments && (
                  <p className="text-sm text-muted-foreground mt-2 bg-muted p-3 rounded">
                    "{fb.comments}"
                  </p>
                )}
                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                  <span>
                    Event: {fb.event?.date ? new Date(fb.event.date).toLocaleDateString() : "Unknown Date"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {feedback.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback submitted yet</p>
              <p className="text-sm text-muted-foreground">Encourage students to share their event experiences</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;