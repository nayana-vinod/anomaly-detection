import { useState, useEffect, Key } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Assignment } from '../types/Assignment';
import Navbar from '../components/Navbar';
import { useUser} from '@supabase/auth-helpers-react'


export default function Assignments() {
  const [assignments, setAssignments] = useState< Assignment[]>([]);
  const user = useUser()

  useEffect(() => {
    const fetchAssignments = async () => {
        const { data, error } = await supabase
          .from<Assignment>('assignments')
          .select("*");
        if (error) throw error;
        setAssignments(data);
    };

    fetchAssignments();
  }, []);

  async function deleteAlert(assignmentId: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)
    if (error) console.log('error', error);
    else {
      const updatedAssignments = assignments.filter((assignment) => assignment.id !== assignmentId);
      setAssignments(updatedAssignments);
    }
  }

  async function handleAccept(alertId:string, assignmentId: string) {
    console.log('in accept')
        const { error } = await supabase
        .from('alerts')
        .update({ isAccepted: true, 
          responder_id: user.id, sentRequest: null  
        })
        .eq('id', (alertId))

        if (error) throw error;
        else deleteAlert(assignmentId)

  }
  async function handleDeny(alertId:any, assignmentId: string) {
      const { error } = await supabase
      .from('alerts') 
      .update({ isAccepted: false, responder_id: null, sentRequest: null })
      .eq('id', alertId)

      if (error) throw error;
      else deleteAlert(assignmentId)
  }


  return (
    <div className="h-screen w-screeen flex justify-center">
        <div className="basis-1/5">
            <Navbar/>
        </div>
        <div className="basis-4/5 p-10">
        {/* <div className="topbar h-15 m-5">
                <p className="text-white">TO ADD A NEW RESPONDER: please create a new account with the corresponding details</p> 
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {
            assignments.filter((assignment) => assignment.responder_id == user.id)
            .map((assignment) => (
            <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
            >
                <p className="text-lg text-black font-semibold my-2">Alert Id: {assignment.alert_id}</p>
                <h3 className="text-black">Assignment Id: {assignment.id}</h3>
              
                <div className="flex m-2 w-4/5 justify-around">
                <button onClick={() => handleAccept(assignment.alert_id, assignment.id)}>Accept</button>
                <button onClick={() => {handleDeny(assignment.alert_id, assignment.id)}}>Deny</button>
                </div> 
                
            </div>
            ))}
            </div>
        </div>
        </div>
  );
}
