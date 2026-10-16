"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllCertificates } from "@/lib/data";
import { Certificate, CertificateType } from "@/lib/types";
import { Eye, ShieldAlert, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(getAllCertificates());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CertificateType>("all");

  const filtered = certificates.filter((cert) => {
    const matchesSearch = search
      ? `${cert.certificateId} ${cert.recipientName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;
    const matchesType = typeFilter === "all" || cert.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard Admin (Simulasi)</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Area ini menampilkan pengelolaan sertifikat dalam bentuk prototipe. Autentikasi dan
            penyimpanan data bersifat disimulasikan dan TIDAK aman untuk produksi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCertificates(getAllCertificates())}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset ke Data Awal
          </Button>
        </div>
      </div>

      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Peringatan Penting</AlertTitle>
        <AlertDescription>
          Prototipe ini menggunakan data dummy dan simulasi autentikasi/penyimpanan lokal
          (client-side). Tidak ada perlindungan server-side yang diterapkan. Sebelum produksi,
          wajib menggantikan lapisan akses data dengan backend yang aman (contoh: Supabase Auth +
          RLS + PostgreSQL).
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Sertifikat</CardTitle>
              <CardDescription>Hanya untuk demonstrasi. Data bersifat sementara.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Cari berdasarkan ID atau nama penerima"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as "all" | CertificateType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="internship">Magang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Sertifikat</TableHead>
                    <TableHead>Penerima</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.certificateId}</TableCell>
                      <TableCell>{cert.recipientName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cert.type === "webinar" ? "Webinar" : "Magang"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cert.status === "valid" ? "default" : "destructive"}
                        >
                          {cert.status === "valid" ? "Valid" : "Dibatalkan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/verify/${cert.certificateId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Tidak ada data yang sesuai dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Fitur Tambah/Edit/Cabut di bawah ini bersifat simulasi (tidak menyimpan ke backend).
              Diperuntukkan untuk prototipe saja.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Sertifikat (Simulasi)
            </CardTitle>
            <CardDescription>Form ini hanya untuk demonstrasi UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Sertifikat</Label>
              <Select defaultValue="webinar">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="internship">Magang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certId">ID Sertifikat</Label>
              <Input id="certId" placeholder="WEB-2026-003" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Nama Penerima</Label>
              <Input id="recipient" placeholder="Nama Lengkap" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Penerbit</Label>
              <Input id="issuer" defaultValue="Lexa Technologies" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea id="notes" rows={3} placeholder="Keterangan tambahan" />
            </div>
            <Button className="w-full" disabled>
              Simpan (Tidak Aktif - Simulasi)
            </Button>
            <p className="text-xs text-muted-foreground">
              Operasi ini dikunci untuk mencegah modifikasi tidak disengaja pada prototipe ini.
              Untuk produksi, tambahkan autentikasi server-side dan validasi terpusat.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}