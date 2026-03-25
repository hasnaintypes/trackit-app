"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Plus, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useGroups } from "@/hooks/use-groups";
import { useContacts } from "@/hooks/use-contacts";
import { SplitStatsCards } from "@/components/pages/(protected)/splits/split-stats-cards";
import { GroupsList } from "@/components/pages/(protected)/splits/groups-list";
import { ContactsList } from "@/components/pages/(protected)/splits/contacts-list";
import { CreateGroupSheet } from "@/components/pages/(protected)/splits/create-group-sheet";
import { ContactSheet } from "@/components/pages/(protected)/splits/contact-sheet";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

export default function SplitsPageClient() {
  // Data hooks
  const {
    groups,
    isLoading: groupsLoading,
    createGroup,
    archiveGroup,
    unarchiveGroup,
    deleteGroup,
    createStatus: groupCreateStatus,
  } = useGroups();

  const {
    contacts,
    isLoading: contactsLoading,
    createContact,
    updateContact,
    deleteContact,
    createStatus: contactCreateStatus,
    updateStatus: contactUpdateStatus,
  } = useContacts();

  const { data: splitSummary, isLoading: summaryLoading } =
    api.overview.splitSummary.useQuery(undefined, {
      staleTime: 1000 * 60 * 2,
    });

  // Sheet state
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<
    (typeof contacts)[number] | null
  >(null);
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.type.toLowerCase().includes(query),
    );
  }, [groups, searchQuery]);

  // Filtered contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.email?.toLowerCase().includes(query) ?? false) ||
        (c.phone?.includes(query) ?? false),
    );
  }, [contacts, searchQuery]);

  // Handlers
  const handleCreateGroup = useCallback(
    async (data: Parameters<typeof createGroup>[0]) => {
      try {
        await createGroup(data);
        toast.success("Group created successfully");
      } catch {
        toast.error("Failed to create group");
      }
    },
    [createGroup],
  );

  const handleArchiveGroup = useCallback(
    async (id: string) => {
      try {
        await archiveGroup({ id });
        toast.success("Group archived");
      } catch {
        toast.error("Failed to archive group");
      }
    },
    [archiveGroup],
  );

  const handleUnarchiveGroup = useCallback(
    async (id: string) => {
      try {
        await unarchiveGroup({ id });
        toast.success("Group unarchived");
      } catch {
        toast.error("Failed to unarchive group");
      }
    },
    [unarchiveGroup],
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      try {
        await deleteGroup({ id });
        toast.success("Group deleted");
      } catch {
        toast.error("Failed to delete group");
      }
    },
    [deleteGroup],
  );

  const handleContactSubmit = useCallback(
    async (data: {
      id?: string;
      name: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
    }) => {
      try {
        if (data.id) {
          await updateContact(data as Parameters<typeof updateContact>[0]);
          toast.success("Contact updated");
        } else {
          await createContact(data);
          toast.success("Contact added");
        }
        setEditingContact(null);
      } catch {
        toast.error(
          data.id ? "Failed to update contact" : "Failed to add contact",
        );
      }
    },
    [createContact, updateContact],
  );

  const handleDeleteContact = useCallback(
    async (id: string) => {
      try {
        await deleteContact({ id });
        toast.success("Contact deleted");
      } catch {
        toast.error("Failed to delete contact");
      }
    },
    [deleteContact],
  );

  const handleEditContact = useCallback(
    (contact: (typeof contacts)[number]) => {
      setEditingContact(contact);
      setContactSheetOpen(true);
    },
    [],
  );

  const handleAddContact = useCallback(() => {
    setEditingContact(null);
    setContactSheetOpen(true);
  }, []);

  const isLoading = groupsLoading || contactsLoading || summaryLoading;

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      {/* Stats Cards */}
      <SplitStatsCards
        youOwe={splitSummary?.youOwe ?? 0}
        youAreOwed={splitSummary?.youAreOwed ?? 0}
        isLoading={isLoading}
      />

      {/* Unified toolbar */}
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="groups">
              Groups
              {groups.length > 0 && (
                <span className="bg-primary/10 text-primary ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {groups.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts">
              Contacts
              {contacts.length > 0 && (
                <span className="bg-primary/10 text-primary ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {contacts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative w-full sm:w-[280px]">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={
                activeTab === "groups"
                  ? "Search groups..."
                  : "Search contacts..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {activeTab === "groups" ? (
            <Button
              onClick={() => setGroupSheetOpen(true)}
              className="shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
          ) : (
            <Button onClick={handleAddContact} className="shrink-0">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      {activeTab === "groups" ? (
        <GroupsList
          groups={filteredGroups}
          isLoading={groupsLoading}
          onCreateGroup={() => setGroupSheetOpen(true)}
          onArchive={handleArchiveGroup}
          onUnarchive={handleUnarchiveGroup}
          onDelete={handleDeleteGroup}
        />
      ) : (
        <ContactsList
          contacts={filteredContacts}
          isLoading={contactsLoading}
          onAddContact={handleAddContact}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />
      )}

      {/* Sheets */}
      <CreateGroupSheet
        open={groupSheetOpen}
        onOpenChange={setGroupSheetOpen}
        contacts={contacts}
        onSubmit={handleCreateGroup}
        isSubmitting={groupCreateStatus === "pending"}
      />

      <ContactSheet
        open={contactSheetOpen}
        onOpenChange={setContactSheetOpen}
        contact={editingContact}
        onSubmit={handleContactSubmit}
        isSubmitting={
          contactCreateStatus === "pending" || contactUpdateStatus === "pending"
        }
      />
    </div>
  );
}
