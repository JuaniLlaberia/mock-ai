'use server';

import { Interview } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { model } from '@/gemini/index';
import { authAction } from './auth';

export const getUserInterviews = async ({
  sort,
  filter,
}: {
  sort: 'createdAt' | 'name';
  filter: string;
}) => {
  const user = await authAction();

  return await db.interview.findMany({
    where: { userId: user.id },
    select: {
      jobRole: true,
      taken: true,
      createdAt: true,
      id: true,
      jobExperience: true,
    },
    orderBy: sort === 'createdAt' ? { createdAt: 'desc' } : { jobRole: 'desc' },
  });
};

export const getInterviewById = async ({
  interviewId,
}: {
  interviewId: string;
}) => {
  const user = await authAction();

  return await db.interview.findUnique({
    where: { id: interviewId, userId: user.id },
  });
};

export const createInterview = async ({
  data,
}: {
  data: Partial<Interview>;
}) => {
  const user = await authAction();

  const { jobRole, jobExperience, jobDescription } = data;
  if (!jobRole || !jobExperience || !jobDescription)
    throw new Error('Missing required data');

  //Create interview
  const { id } = await db.interview.create({
    data: {
      jobRole,
      jobExperience,
      jobDescription,
      taken: false,
      userId: user.id,
    },
  });

  //Create questions using gemini model
  const prompt = `Generate job interview questions for the role of ${jobRole} with a 
    ${jobExperience} level. The job description and content is: "${jobDescription}". 
    For each question provide the question and a hint (short text to help the 
    user understand the question) in this json schema format: {questions: [{question, hint}]}. Based on 
    the experience level generate between 4-6 questions.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const jsonData = response.text();

  const questions: { question: string; hint: string }[] =
    JSON.parse(jsonData).questions;

  const questionsWithId = questions.map(question => {
    return { ...question, interviewId: id };
  });

  //Store questions in db
  await db.question.createMany({ data: questionsWithId });

  return id;
};

//Remove the interview and all data related
export const deleteInterview = async ({
  interviewId,
}: {
  interviewId: string;
}) => {
  const user = await authAction();

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true, id: true },
  });
  if (!interview) throw new Error('Interview not found');

  if (interview?.userId !== user.id)
    throw new Error('This interview does not belong to you');

  await db.$transaction([
    // db.answer.deleteMany({ where: { interviewId: interview.id } }),
    db.interviewAttempt.deleteMany({ where: { interviewId: interview.id } }),
    db.question.deleteMany({ where: { interviewId: interview.id } }),
    db.interview.delete({ where: { id: interview.id } }),
  ]);

  revalidatePath('/dashboard');
};
