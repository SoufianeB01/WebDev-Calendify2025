export interface Employee{
    user_id: number,
    name: string,
    email: string,
    role: string,
    password: string
}

export type ViewState = 
"Home" |
"Login" |
"Admin" |
"Officeattendance" |
"Roombooking" |
"Events" |
"User attendance"


export interface HomeState {
    
}

