import { Button } from "@/components/ui/button";
import { Bell, Heart, Leaf, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-16">
        {/* Decorative background blobs */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.44 0.14 147) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Leaf className="h-3.5 w-3.5" />
              Fighting Food Waste Together
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Turn Surplus Food
              <br />
              into{" "}
              <span
                className="italic"
                style={{ color: "oklch(0.44 0.14 147)" }}
              >
                Community Hope
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
              Restaurants, hotels, and events donate surplus food. NGOs and food
              shelters receive instant notifications and arrange pickup — all in
              minutes.
            </p>

            <Button
              size="lg"
              className="h-12 px-8 text-base gap-2 shadow-glow"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="nav.primary_button"
            >
              <Heart className="h-4 w-4" />
              {isLoggingIn ? "Connecting..." : "Get Started"}
            </Button>
          </motion.div>

          <motion.img
            src="/assets/generated/foodbridge-hero.dim_800x500.png"
            alt="Food donation illustration"
            className="w-full max-w-lg mx-auto mt-10 rounded-2xl shadow-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12 bg-secondary/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            How FoodBridge Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                step: "01",
                title: "Donors Submit",
                desc: "Restaurants & hotels fill a quick form — food type, quantity, pickup address.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Bell,
                step: "02",
                title: "NGOs Notified",
                desc: "Local food shelters get instant alerts and can accept donations with one tap.",
                color: "bg-amber-100 text-amber-700",
              },
              {
                icon: MapPin,
                step: "03",
                title: "Pickup Guided",
                desc: "A live map shows pickup location, distance, and estimated travel time.",
                color: "bg-blue-100 text-blue-700",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-2xl p-5 shadow-card text-center"
              >
                <div
                  className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-1">
                  {item.step}
                </p>
                <h3 className="font-display font-semibold mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "2.4M", label: "Meals Saved" },
              { value: "340+", label: "Partner NGOs" },
              { value: "98%", label: "Pickup Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
