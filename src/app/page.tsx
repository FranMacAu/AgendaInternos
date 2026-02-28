"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Contact } from "@/types/contact";
import { ContactCard } from "@/components/ContactCard";
import { ContactForm } from "@/components/ContactForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);

  useEffect(() => {
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      Object.values(contact).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [contacts, searchTerm]);

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingContact(undefined);
    setIsFormOpen(true);
  };

  return (
    <main className="min-h-screen bg-background font-body p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              ContactVault
            </h1>
            <p className="text-muted-foreground">Tu agenda profesional de contactos y servicios.</p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="h-5 w-5" />
            Agregar Contacto
          </Button>
        </div>

        {/* Search and Filters Section */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            className="pl-10 h-12 text-lg bg-white border-border/50 shadow-sm focus-visible:ring-accent"
            placeholder="Buscar por nombre, teléfono, servicio o horario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Contact List Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="inline-block p-6 bg-secondary rounded-full">
              <Users className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xl text-muted-foreground font-medium">
              {searchTerm ? "No se encontraron contactos que coincidan." : "Aún no tienes contactos guardados."}
            </p>
            {!searchTerm && (
              <Button onClick={handleAdd} variant="outline" className="text-accent border-accent">
                Empieza agregando tu primer contacto
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline">
              {editingContact ? "Editar Contacto" : "Agregar Nuevo Contacto"}
            </DialogTitle>
            <DialogDescription>
              Completa los detalles a continuación para {editingContact ? "actualizar el" : "crear un"} contacto.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            contact={editingContact}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
  );
}