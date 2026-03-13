import { PrismaClient, UserType, Species, Gender, AppointmentType, AppointmentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with dummy data...');

    // Clean up existing data for a fresh start (optional, but good for reliable seeding)
    await prisma.clinicVeterinarian.deleteMany();
    await prisma.clinic.deleteMany();
    await prisma.veterinarian.deleteMany();
    await prisma.petOwner.deleteMany();
    await prisma.user.deleteMany();

    // Password hash for 'password123'
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create a Clinic Admin & Clinic
    const clinicAdminUser = await prisma.user.create({
        data: {
            email: 'admin@vetcareclinic.com',
            phone: '+94770000001',
            firstName: 'Admin',
            lastName: 'User',
            passwordHash,
            userType: UserType.CLINIC_ADMIN,
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true,
            admin: {
                create: {
                    role: 'clinic_admin',
                },
            },
        },
    });

    const clinic = await prisma.clinic.create({
        data: {
            name: 'Paws & Claws Veterinary Hospital',
            registrationNumber: 'REG-12345',
            address: '123 Main Road, Colombo 03',
            city: 'Colombo',
            phone: '+94112233445',
            email: 'contact@pawsandclaws.com',
            status: 'ACTIVE',
            latitude: 6.906,
            longitude: 79.851,
            facilities: ['X-Ray', 'Surgery', 'Pharmacy', 'Laboratory'],
        },
    });

    // 2. Create Veterinarians
    const vetUsers = [
        { email: 'dr.smith@example.com', phone: '+94771111111', fn: 'John', ln: 'Smith', city: 'Colombo' },
        { email: 'dr.jane@example.com', phone: '+94772222222', fn: 'Jane', ln: 'Doe', city: 'Kandy' },
        { email: 'dr.silva@example.com', phone: '+94773333333', fn: 'Nuwan', ln: 'Silva', city: 'Galle' },
    ];

    for (let i = 0; i < vetUsers.length; i++) {
        const vu = vetUsers[i];
        await prisma.user.create({
            data: {
                email: vu.email,
                phone: vu.phone,
                firstName: vu.fn,
                lastName: vu.ln,
                passwordHash,
                userType: UserType.VETERINARIAN,
                status: 'ACTIVE',
                emailVerified: true,
                phoneVerified: true,
                veterinarian: {
                    create: {
                        licenseNumber: `VET-${1000 + i}`,
                        bio: `Experienced veterinarian specializing in general care. Based in ${vu.city}.`,
                        yearsOfExperience: 5 + i * 2,
                        consultationFeeClinic: 2500,
                        consultationFeeHome: 5000,
                        consultationFeeOnline: 1500,
                        verified: true,
                        rating: 4.5 + (i * 0.1),
                        reviewCount: 15 + i * 5,
                        specializations: {
                            create: [
                                { specialization: 'General Practice' },
                                { specialization: i % 2 === 0 ? 'Surgery' : 'Dermatology' },
                            ],
                        },
                        clinicAffiliations: i === 0 ? {
                            create: {
                                clinicId: clinic.id,
                                isPrimary: true,
                            }
                        } : undefined,
                    },
                },
            },
        });
    }

    // 3. Create a Pet Owner & Pet
    const ownerUser = await prisma.user.create({
        data: {
            email: 'owner@example.com',
            phone: '+94779999999',
            firstName: 'Kamal',
            lastName: 'Perera',
            passwordHash,
            userType: UserType.PET_OWNER,
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true,
            petOwner: {
                create: {
                    firstName: 'Kamal',
                    lastName: 'Perera',
                    pets: {
                        create: [
                            {
                                name: 'Rex',
                                species: Species.DOG,
                                breed: 'Golden Retriever',
                                gender: Gender.MALE,
                                weight: 25.5,
                            },
                            {
                                name: 'Luna',
                                species: Species.CAT,
                                breed: 'Persian',
                                gender: Gender.FEMALE,
                                weight: 4.2,
                            }
                        ]
                    }
                }
            }
        }
    });

    console.log('Dummy data inserted successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
