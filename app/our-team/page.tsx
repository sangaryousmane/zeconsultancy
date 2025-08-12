import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import ALIEU from './alieu.jpg'
import OUSMANE from './ousmane.jpg'
import ATALIB from './ag.jpg'

const team = [
  {
    name: 'OUSMANE SANGARY',
    role: 'General Manager',
    image: OUSMANE,
    bio: 'Master of Science in Computer Science. Expert in streamlining complex processes and ensuring client satisfaction with timely project delivery. Experience in leading cross-functional teams and managing large-scale projects.',
  },
 {
    name: 'Alieu [Last Name]',
    role: 'Certified Broker & Logistics Expert',
    image: ALIEU, 
    bio: 'Alieu holds a BSc degree and is a certified Broker with extensive expertise in brokerage, freight management, import and export operations. He has successfully managed complex logistics chains, negotiated favorable trade agreements, streamlined customs clearance processes.',
},
  {
    name: 'Almousleck Atalib Ag',
    role: 'Lead Software Developer',
    image: ATALIB,
    bio: 'Passionate software engineer with expertise in Java, Node.js, Golang, Flutter, and React, delivering secure and scalable digital solutions.',
  },
]

export default function TeamPage() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 pt-16">
      
      {/* Background Gradient Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><br /><br />
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" /> 
            <span className="text-xs sm:text-lg font-semibold gradient-text">Meet Our Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-6">
            The People Behind Our Success
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            A dedicated team of professionals committed to making documentation processes smooth, accurate, and stress-free.
          </p>
        </div>

        {/* About Our Team */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">About Our Team</h2>
          <p className="text-muted-foreground">
            Our team is a diverse group of experts, each bringing unique skills and perspectives to the table.
            We believe in collaboration, innovation, and a shared commitment to excellence. Together, we ensure
            that every project is executed with precision, creativity, and care.
          </p>
        </div>
        <br />

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
          {team.map((member, index) => (
            <div
              key={index}
              className="group bg-card rounded-3xl border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative w-full h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Work With Us?</h2>
          <p className="text-muted-foreground mb-6">
            Whether you’re looking to collaborate, join our team, or learn more about what we do, we’d love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-primary text-white rounded-full shadow hover:bg-primary/90 transition"
          >
            Contact Us
          </a> 
        </div> <br />
        
    </section>
  )
}
