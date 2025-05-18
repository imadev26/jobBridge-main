"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { companyDashboardService } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, Briefcase, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalOffers: number;
  totalApplications: number;
  applicationsByStatus: {
    [status: string]: number;
  };
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACCEPTED": return "default";
    case "REJECTED": return "destructive";
    case "INTERVIEW_SCHEDULED": return "outline";
    default: return "secondary";
  }
};

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || authLoading) {
      return;
    }

    if (!isAuthenticated || role !== "COMPANY") {
      console.log('Redirecting non-company or unauthenticated user to login');
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await companyDashboardService.getDashboardStats();
        console.log('Company dashboard stats fetched:', response.data);
        setStats(response.data);
      } catch (err: any) {
        console.error("Error fetching company dashboard stats:", err);
        if (err.response && err.response.status === 403) {
          setError("Vous n'êtes pas autorisé à voir ce tableau de bord.");
        } else {
          setError("Une erreur est survenue lors du chargement du tableau de bord.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

  }, [isClient, authLoading, isAuthenticated, role, router]);

  const getApplicationsByStatusArray = (applicationsByStatus: DashboardStats['applicationsByStatus'] | undefined) => {
    if (!applicationsByStatus) return [];
    return Object.entries(applicationsByStatus).map(([status, count]) => ({ status, count }));
  };

  if (authLoading || !isClient) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement de l'authentification...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center">Chargement du tableau de bord...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center text-red-500">Erreur: {error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1">
          <div className="container mx-auto py-6 text-center text-gray-500">Données du tableau de bord introuvables ou non chargées.</div>
        </main>
        <Footer />
      </div>
    );
  }

  const applicationsByStatusArray = getApplicationsByStatusArray(stats.applicationsByStatus);

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-gray-100 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Tableau de bord de l'entreprise</h1>
            <p className="text-gray-600">Aperçu rapide des statistiques de vos offres et candidatures.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des offres</CardTitle>
                <Briefcase className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalOffers}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des candidatures</CardTitle>
                <Users className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>Candidatures par statut</CardTitle>
              <p className="text-sm text-gray-600">Répartition de toutes les candidatures par leur statut actuel.</p>
            </CardHeader>
            <CardContent className="p-0">
              {applicationsByStatusArray.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70%]">Statut</TableHead>
                      <TableHead className="text-right">Nombre</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicationsByStatusArray.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{formatStatus(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStatusBadgeVariant(item.status)}>{item.count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-gray-500">Aucune donnée de statut disponible.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 