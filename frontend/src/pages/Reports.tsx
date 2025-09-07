import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Star, Calendar, Award, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EventPopularity = {
  event_name: string;
  registration_count: number;
  attendance_count: number;
  attendance_rate: number;
};

type StudentParticipation = {
  student_name: string;
  roll_number: string;
  events_registered: number;
  events_attended: number;
  participation_rate: number;
};

type TopStudent = {
  student_name: string;
  roll_number: string;
  total_events: number;
  avg_rating: number;
};

const Reports = () => {
  const [eventPopularity, setEventPopularity] = useState<EventPopularity[]>([]);
  const [studentParticipation, setStudentParticipation] = useState<StudentParticipation[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchReports();
    fetchEventTypes();
  }, [eventTypeFilter]);

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("type")
        .not("type", "is", null);

      if (error) throw error;
      
      const uniqueTypes = [...new Set(data?.map(event => event.type).filter(Boolean))] as string[];
      setEventTypes(uniqueTypes);
    } catch (error) {
      console.error("Failed to fetch event types:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEventPopularity(),
        fetchStudentParticipation(),
        fetchTopStudents(),
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventPopularity = async () => {
    try {
      let query = supabase
        .from("events")
        .select(`
          event_id,
          name,
          type,
          registrations:registrations(count),
          attendance:attendance(count)
        `);

      if (eventTypeFilter) {
        query = query.eq("type", eventTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const popularity = data?.map(event => {
        const registrationCount = event.registrations?.[0]?.count || 0;
        const attendanceCount = event.attendance?.[0]?.count || 0;
        return {
          event_name: event.name,
          registration_count: registrationCount,
          attendance_count: attendanceCount,
          attendance_rate: registrationCount > 0 ? Math.round((attendanceCount / registrationCount) * 100) : 0
        };
      }) || [];

      setEventPopularity(popularity.sort((a, b) => b.registration_count - a.registration_count));
    } catch (error) {
      console.error("Failed to fetch event popularity:", error);
    }
  };

  const fetchStudentParticipation = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          student_id,
          name,
          roll_number,
          registrations:registrations(count),
          attendance:attendance(count)
        `);

      if (error) throw error;

      const participation = data?.map(student => {
        const eventsRegistered = student.registrations?.[0]?.count || 0;
        const eventsAttended = student.attendance?.filter((att: any) => att.status === 'Present').length || 0;
        return {
          student_name: student.name,
          roll_number: student.roll_number,
          events_registered: eventsRegistered,
          events_attended: eventsAttended,
          participation_rate: eventsRegistered > 0 ? Math.round((eventsAttended / eventsRegistered) * 100) : 0
        };
      }) || [];

      setStudentParticipation(participation.sort((a, b) => b.events_registered - a.events_registered));
    } catch (error) {
      console.error("Failed to fetch student participation:", error);
    }
  };

  const fetchTopStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          student_id,
          name,
          roll_number,
          attendance:attendance(count),
          feedback:feedback(rating)
        `);

      if (error) throw error;

      const topStudents = data?.map(student => {
        const totalEvents = student.attendance?.[0]?.count || 0;
        const feedbackRatings = student.feedback?.map((fb: any) => fb.rating).filter(Boolean) || [];
        const avgRating = feedbackRatings.length > 0 
          ? feedbackRatings.reduce((sum: number, rating: number) => sum + rating, 0) / feedbackRatings.length 
          : 0;
        
        return {
          student_name: student.name,
          roll_number: student.roll_number,
          total_events: totalEvents,
          avg_rating: Math.round(avgRating * 10) / 10
        };
      }).filter(student => student.total_events > 0) || [];

      setTopStudents(topStudents.sort((a, b) => b.total_events - a.total_events).slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch top students:", error);
    }
  };

  const eventTypeData = eventPopularity.reduce((acc, event) => {
    const existing = acc.find(item => item.name === event.event_name);
    if (existing) {
      existing.value += event.registration_count;
    } else {
      acc.push({ name: event.event_name, value: event.registration_count });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground">Comprehensive insights into campus event performance</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Event Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Event Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{eventPopularity.length}</div>
            <p className="text-xs text-muted-foreground">Events analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {eventPopularity.reduce((sum, event) => sum + event.registration_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {eventPopularity.length > 0 
                ? Math.round(eventPopularity.reduce((sum, event) => sum + event.attendance_rate, 0) / eventPopularity.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{topStudents.length}</div>
            <p className="text-xs text-muted-foreground">With attendance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Popularity</CardTitle>
            <CardDescription>Registration and attendance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPopularity.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="registration_count" fill="#8884d8" name="Registrations" />
                <Bar dataKey="attendance_count" fill="#82ca9d" name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
            <CardDescription>Registration distribution by event</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Events</CardTitle>
            <CardDescription>Events with highest attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventPopularity
                  .sort((a, b) => b.attendance_rate - a.attendance_rate)
                  .slice(0, 5)
                  .map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{event.event_name}</TableCell>
                      <TableCell>{event.registration_count}</TableCell>
                      <TableCell>{event.attendance_count}</TableCell>
                      <TableCell>
                        <Badge 
                          className={event.attendance_rate >= 80 ? "bg-green-100 text-green-800" : 
                                   event.attendance_rate >= 60 ? "bg-yellow-100 text-yellow-800" : 
                                   "bg-red-100 text-red-800"}
                        >
                          {event.attendance_rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Active Students</CardTitle>
            <CardDescription>Students with highest event participation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.slice(0, 5).map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.student_name}</TableCell>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.total_events}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {student.avg_rating || "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;