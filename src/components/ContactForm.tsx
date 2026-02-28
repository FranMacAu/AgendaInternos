
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/contact";
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio." }),
  phone: z.string().optional(),
  service: z.string().min(2, { message: "Especifica el servicio." }),
  schedule: z.string().optional(),
});

interface ContactFormProps {
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const { toast } = useToast();
  const db = useFirestore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact?.name || "",
      phone: contact?.phone || "",
      service: contact?.service || "",
      schedule: contact?.schedule || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    if (contact) {
      const docRef = doc(db, "contacts", contact.id);
      updateDoc(docRef, { ...values })
        .then(() => {
          toast({ title: "Actualizado", description: "Cambios guardados." });
          onSuccess();
        })
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: values,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      const contactsCol = collection(db, "contacts");
      const data = { ...values, createdAt: Date.now() };
      
      addDoc(contactsCol, data)
        .then(() => {
          toast({ title: "Creado", description: "Nuevo contacto en la agenda." });
          onSuccess();
        })
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: contactsCol.path,
            operation: 'create',
            requestResourceData: data,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la persona o empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+54 9..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Plomería, Diseño Web..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Lunes a Viernes 9-18hs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cerrar
          </Button>
          <Button type="submit" className="bg-primary">
            {contact ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
