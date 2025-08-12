'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const contactInfo = [
  { icon: Phone, title: 'Phone', details: '+231 775 131 436', description: 'Call us for immediate assistance' },
  { icon: MessageCircle, title: 'WhatsApp', details: '+8615072486774', description: 'Message us on WhatsApp' },
  { icon: Mail, title: 'Email', details: 'info@zeincorporated.com', description: 'Send us an email anytime' },
  { icon: MapPin, title: 'Address', details: 'Broad and Buchanan Street, Monrovia, Liberia', description: 'Visit our office location' },
  { icon: Clock, title: 'Hours', details: 'Mon-Sat: 8AM-6PM', description: 'Our business hours' },
]

const departments = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'brokerage', label: 'Brokerage Services' },
  { value: 'support', label: 'Technical Support' },
]

export default function ContactPage() {
  const motionProps = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }

  return (
    <div className="min-h-screen pt-16">
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Contact <span className="gradient-text">Us</span></h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">Get in touch with our team for equipment rental, brokerage services, software development, expats documentation, or any questions about our offerings.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <motion.div key={info.title} {...motionProps} transition={{ duration: 0.6, delay: index * 0.1 }}>
                  <Card className="text-center hover-glow">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4"><Icon className="w-6 h-6 text-primary" /></div>
                      <h3 className="font-semibold mb-2">{info.title}</h3>
                      <p className="text-sm font-medium mb-1">{info.details}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="text-sm font-medium mb-2 block">First Name</label><Input placeholder="John" /></div>
                      <div><label className="text-sm font-medium mb-2 block">Last Name</label><Input placeholder="Doe" /></div>
                    </div>
                    <div><label className="text-sm font-medium mb-2 block">Email</label><Input type="email" placeholder="john@example.com" /></div>
                    <div><label className="text-sm font-medium mb-2 block">Phone</label><Input type="tel" placeholder="+1 (555) 123-4567" /></div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department</label>
                      <select className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm">
                        {departments.map((dept) => (<option key={dept.value} value={dept.value}>{dept.label}</option>))}
                      </select>
                    </div>
                    <div><label className="text-sm font-medium mb-2 block">Subject</label><Input placeholder="How can we help you?" /></div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <textarea className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm min-h-[120px] resize-none" placeholder="Tell us more about your needs..." />
                    </div>
                    <Button className="w-full" size="lg"><Send className="w-4 h-4 mr-2" />Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Let's Start a <span className="gradient-text">Conversation</span></h2>
                <p className="text-muted-foreground mb-6">Whether you need equipment rental, brokerage services, software development, expat documentation, or have questions about our offerings, our team is ready to help.</p>
              </div>
              <div className="space-y-6">
                <div className="glass-effect p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Equipment Rental Inquiries</h3>
                  <p className="text-sm text-muted-foreground">Need construction or industrial equipment? Our rental specialists can help you find the right equipment for your project.</p>
                </div>
                <div className="glass-effect p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Brokerage Services</h3>
                  <p className="text-sm text-muted-foreground">Professional brokerage services for real estate and business transactions with expert guidance.</p>
                </div>
                <div className="glass-effect p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Expats Documentation Services</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive documentation services for expats working and navigating life in Liberia.</p>
                </div>
                <div className="glass-effect p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Software Development Services</h3>
                  <p className="text-sm text-muted-foreground">Custom software development solutions tailored to your business needs.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}