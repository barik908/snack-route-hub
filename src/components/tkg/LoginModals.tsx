import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/tkg/store";

export type PanelKind = "admin" | "vendor" | "rider" | null;

export function LoginModals({
  open,
  onOpenChange,
}: {
  open: PanelKind;
  onOpenChange: (v: PanelKind) => void;
}) {
  const { loginAdmin, loginVendor, loginRider } = useStore();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const close = () => {
    setId("");
    setPw("");
    onOpenChange(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (open === "admin") {
      if (loginAdmin(pw)) {
        close();
        void navigate({ to: "/admin" });
      } else toast.error("Invalid admin password");
      return;
    }
    if (open === "vendor") {
      if (loginVendor(id, pw)) {
        close();
        void navigate({ to: "/vendor" });
      } else toast.error("Invalid vendor credentials");
      return;
    }
    if (open === "rider") {
      if (loginRider(id, pw)) {
        close();
        void navigate({ to: "/rider" });
      } else toast.error("Invalid rider credentials");
    }
  };

  const title =
    open === "admin"
      ? "Super Admin Access"
      : open === "vendor"
        ? "Vendor / Shopkeeper Login"
        : "Delivery Rider Login";

  return (
    <Dialog open={open !== null} onOpenChange={(v) => (v ? null : close())}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {open !== "admin" && (
            <div className="space-y-2">
              <Label htmlFor="tkg-id">{open === "vendor" ? "Shop phone / ID" : "Rider phone / ID"}</Label>
              <Input
                id="tkg-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="01711000001"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tkg-pw">Password</Label>
            <Input
              id="tkg-pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Unlock panel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
