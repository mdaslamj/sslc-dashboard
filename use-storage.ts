import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage, storageSync } from "../lib/storage";
import { SubjectData, StudentProfile, Subject, StudyLog, MockTest, WeakTopic, Reminder } from "../lib/data-model";

const USER_ID = "local_user";

export function useProfile() {
  return useQuery({
    queryKey: ["profile", USER_ID],
    queryFn: () => storage.getProfile(USER_ID),
    initialData: () => storageSync.getProfile(USER_ID),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: StudentProfile) => storage.saveProfile(USER_ID, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", USER_ID] });
    },
  });
}

export function useSubjectData(subject: Subject) {
  return useQuery({
    queryKey: ["subject", USER_ID, subject],
    queryFn: () => storage.getSubjectData(USER_ID, subject),
    initialData: () => storageSync.getSubjectData(USER_ID, subject),
  });
}

export function useAllSubjectsData() {
  const subjects: Subject[] = ["mathematics", "science", "socialScience", "kannada", "english"];
  return useQuery({
    queryKey: ["allSubjects", USER_ID],
    queryFn: async () => {
      const results = await Promise.all(
        subjects.map((s) => storage.getSubjectData(USER_ID, s))
      );
      return Object.fromEntries(subjects.map((s, i) => [s, results[i]])) as Record<Subject, SubjectData>;
    },
    initialData: () =>
      Object.fromEntries(
        subjects.map((s) => [s, storageSync.getSubjectData(USER_ID, s)])
      ) as Record<Subject, SubjectData>,
  });
}

export function useUpdateSubjectData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubjectData) => storage.saveSubjectData(USER_ID, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subject", USER_ID, variables.subject] });
      queryClient.invalidateQueries({ queryKey: ["allSubjects", USER_ID] });
    },
  });
}

export function useStudyLogs() {
  return useQuery({
    queryKey: ["studyLogs", USER_ID],
    queryFn: () => storage.getStudyLogs(USER_ID),
    initialData: () => storageSync.getStudyLogs(USER_ID),
  });
}

export function useAddStudyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<StudyLog, "id">) => storage.addStudyLog(USER_ID, log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyLogs", USER_ID] });
    },
  });
}

export function useDeleteStudyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => storage.deleteStudyLog(USER_ID, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyLogs", USER_ID] });
    },
  });
}

export function useMockTests() {
  return useQuery({
    queryKey: ["mockTests", USER_ID],
    queryFn: () => storage.getMockTests(USER_ID),
    initialData: () => storageSync.getMockTests(USER_ID),
  });
}

export function useAddMockTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (test: Omit<MockTest, "id">) => storage.addMockTest(USER_ID, test),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockTests", USER_ID] });
    },
  });
}

export function useDeleteMockTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => storage.deleteMockTest(USER_ID, testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockTests", USER_ID] });
    },
  });
}

export function useWeakTopics() {
  return useQuery({
    queryKey: ["weakTopics", USER_ID],
    queryFn: () => storage.getWeakTopics(USER_ID),
    initialData: () => storageSync.getWeakTopics(USER_ID),
  });
}

export function useAddWeakTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topic: Omit<WeakTopic, "id">) => storage.addWeakTopic(USER_ID, topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weakTopics", USER_ID] });
    },
  });
}

export function useUpdateWeakTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WeakTopic> }) =>
      storage.updateWeakTopic(USER_ID, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weakTopics", USER_ID] });
    },
  });
}

export function useDeleteWeakTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => storage.deleteWeakTopic(USER_ID, topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weakTopics", USER_ID] });
    },
  });
}

export function useReminders() {
  return useQuery({
    queryKey: ["reminders", USER_ID],
    queryFn: () => storage.getReminders(USER_ID),
    initialData: () => storageSync.getReminders(USER_ID),
  });
}

export function useAddReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminder: Omit<Reminder, "id">) => storage.addReminder(USER_ID, reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", USER_ID] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Reminder> }) =>
      storage.updateReminder(USER_ID, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", USER_ID] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reminderId: string) => storage.deleteReminder(USER_ID, reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", USER_ID] });
    },
  });
}
