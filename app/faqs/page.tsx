"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FAQ {
  id: string
  question: string
  answer: string
  created_at: string
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
    })
    setEditingFaq(null)
  }

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question || !formData.answer) {
      toast({
        title: "Error",
        description: "Please fill in both question and answer",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      if (editingFaq) {
        const { error } = await supabase.from("faqs").update(formData).eq("id", editingFaq.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("faqs").insert([formData])

        if (error) throw error
      }

      toast({
        title: "Success",
        description: `FAQ ${editingFaq ? "updated" : "created"} successfully`,
      })

      setDialogOpen(false)
      resetForm()
      fetchFaqs()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingFaq ? "update" : "create"} FAQ`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteFaq = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      })
      fetchFaqs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1">
        <PageHeader title="FAQs" description="Manage frequently asked questions" />
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <PageHeader title="FAQs" description="Manage frequently asked questions">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingFaq ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-6">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(faq)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteFaq(faq.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {faqs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No FAQs created yet. Add your first FAQ above.</div>
        )}
      </div>
    </div>
  )
}
