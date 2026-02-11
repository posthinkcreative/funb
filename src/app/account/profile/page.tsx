'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { updateProfile, updateEmail } from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z
    .string({
      required_error: "Please enter an email.",
    })
    .email(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  })
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      form.reset({
        name: user.displayName || "",
        email: user.email || "",
      });
    }
  }, [user, isUserLoading, router, form]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    try {
      if (data.name !== user.displayName) {
        await updateProfile(user, { displayName: data.name });
      }
      // Note: Updating email requires re-authentication. 
      // For simplicity, we'll just show a success message.
      // In a real app, you would handle re-authentication flow.
      if (data.email !== user.email) {
        // await updateEmail(user, data.email);
         toast({
          title: "Email Change Notice",
          description: "Changing your email requires re-authentication. This feature is not fully implemented in this demo.",
          variant: "default",
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });

    } catch (error: any) {
       toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (isUserLoading || !user) {
    return (
      <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Manage your account settings and email preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
              <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
              </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
              </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
              <Skeleton className="h-10 w-28" />
          </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Manage your account settings and email preferences.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
              <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                      <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
              <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                      <Input placeholder="Your email" {...field} />
                  </FormControl>
                   <FormDescription>
                      Changing email requires re-authentication (demo only).
                    </FormDescription>
                  <FormMessage />
                  </FormItem>
              )}
              />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
              <Button type="submit">Save Changes</Button>
          </CardFooter>
          </form>
      </Form>
    </Card>
  )
}
