import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Event = {
  event_id: number;
  name: string;
  date: string;
  time: string;
  location: string;
};

type Student = {
  student_id: number;
  name: string;
  roll_number: string;
  department: string;
};

type Registration = {
  registration_id: number;
  event_id: number;
  student_id: number;
  student: Student;
};

type AttendanceRecord = {
  attendance_id?: number;
  event_id: number;
  student_id: number;
  status: string;
};

const Attendance = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrationsAndAttendance();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("event_id, name, date, time, location")
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    }
  };

  const fetchRegistrationsAndAttendance = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      // Fetch registrations with student details
      const { data: regData, error: regError } = await supabase
        .from("registrations")
        .select(`
          registration_id,
          event_id,
          student_id,
          students:student_id (
            student_id,
            name,
            roll_number,
            department
          )
        `)
        .eq("event_id", parseInt(selectedEvent));

      if (regError) throw regError;

      // Transform the data to match our type
      const transformedRegistrations = regData?.map(reg => ({
        registration_id: reg.registration_id,
        event_id: reg.event_id,
        student_id: reg.student_id,
        student: Array.isArray(reg.students) ? reg.students[0] : reg.students
      })) || [];

      setRegistrations(transformedRegistrations);

      // Fetch existing attendance records
      const { data: attData, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .eq("event_id", parseInt(selectedEvent));

      if (attError) throw attError;
      setAttendance(attData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (studentId: number, status: string) => {
    try {
      const existingRecord = attendance.find(
        (att) => att.student_id === studentId && att.event_id === parseInt(selectedEvent)
      );

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("attendance")
          .update({ status })
          .eq("attendance_id", existingRecord.attendance_id);

        if (error) throw error;

        setAttendance(prev =>
          prev.map(att =>
            att.attendance_id === existingRecord.attendance_id
              ? { ...att, status }
              : att
          )
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("attendance")
          .insert([{
            event_id: parseInt(selectedEvent),
            student_id: studentId,
            status
          }])
          .select();

        if (error) throw error;

        if (data) {
          setAttendance(prev => [...prev, ...data]);
        }
      }

      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const getAttendanceStatus = (studentId: number) => {
    const record = attendance.find(
      (att) => att.student_id === studentId && att.event_id === parseInt(selectedEvent)
    );
    return record?.status || "Not Marked";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "Absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case "Late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const selectedEventData = events.find(e => e.event_id.toString() === selectedEvent);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground">Track and manage student attendance for events</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Select Event
            </CardTitle>
            <CardDescription>Choose an event to manage attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.event_id} value={event.event_id.toString()}>
                    {event.name} - {new Date(event.date).toLocaleDateString()} at {event.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedEvent && selectedEventData && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedEventData.name}</CardTitle>
              <CardDescription>
                {new Date(selectedEventData.date).toLocaleDateString()} at {selectedEventData.time} - {selectedEventData.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {registrations.length} Registered
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {attendance.filter(att => att.status === "Present").length} Present
                </div>
                <div className="flex items-center">
                  <XCircle className="mr-1 h-4 w-4" />
                  {attendance.filter(att => att.status === "Absent").length} Absent
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription>Mark attendance for registered students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading registrations...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.registration_id}>
                      <TableCell className="font-medium">
                        {registration.student?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{registration.student?.roll_number || "N/A"}</TableCell>
                      <TableCell>{registration.student?.department || "N/A"}</TableCell>
                      <TableCell>
                        {getStatusBadge(getAttendanceStatus(registration.student_id))}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAttendance(registration.student_id, "Present")}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAttendance(registration.student_id, "Absent")}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAttendance(registration.student_id, "Late")}
                          >
                            <Clock className="mr-1 h-4 w-4" />
                            Late
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {registrations.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students registered for this event</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedEvent && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select an event to manage attendance</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;