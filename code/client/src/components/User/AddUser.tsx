import React, {useState, useContext} from "react";
import { myContext } from "../../Context";
import axios from "axios";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const AddUser = (props:any) => {
    const { 
        setUsers, 
        users, 
        chosenRole,
        currentMainDirectory
    } = props;

    const userObject: any = useContext(myContext);
    const [textFieldValue, setTextFieldValue] = useState("");
    const [ isError, setIsError ] = useState(false);
    const [ isAdding, setIsAdding ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

    const createPermission = async (role: string,mainDirectoryId: string, emailAddresses: any[], type: string, deleteExistingPermission: boolean, refreshToken: string) =>{
        const res = await axios.post("/api/user/add",{
            role,
            type,
            mainDirectoryId,
            emailAddresses,
            deleteExistingPermission,
            refreshToken
        });
        return res;
    }

    const createPermissionHandler = async(splitEmails : any[]) =>{
        const res = await createPermission('reader',currentMainDirectory.id,splitEmails,'user',true,userObject.refreshToken);
        
        return res;
        
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTextFieldValue(event.target.value);
    } 


    const updateRoleUsers = async(roleId: string, userIds: string[]) => {
        const res = await axios.patch(`api/role/update/${roleId}/`,{
            userIds
        });
    }

    const fetchUser = async(emailAddresses: string[], permissions: any[]) => {
        
        const res = await axios.post("/api/user/fetch",{
            emailAddresses,
            permissions
        });
        return res.data;
    }

    const addUserRoles = async(userId: string, roleId: string) => {
        const res = await axios.patch(`/api/user/${userId}/add/role`,{
            roleId
        });
        
        return res;
    }

    const validateEmailAddresses = (emailAddresses: string[]) => {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        let passed : Boolean = true;
        
        for( let i = 0; i < emailAddresses.length; i++){
            const isValidEmailAddress = regex.test(emailAddresses[i]);
            if(!isValidEmailAddress){
                passed = false;
                break;
            }
        }

        return passed;
    
    }

    const checkDuplicateEmailAddress = ( newEmailAddresses: string [], existingUsers: any [] ) =>{
        let hasDuplicateInNewEmailAddresses = false;
        hasDuplicateInNewEmailAddresses = newEmailAddresses.some((element,index) =>{
            return newEmailAddresses.indexOf(element) !== index;
        });

        if(hasDuplicateInNewEmailAddresses) return true;

        const existingEmailAddresses = existingUsers.map((user:any) => user.emailAddress);
        for( let i = 0; i < newEmailAddresses.length; i++){
            if(existingEmailAddresses.includes(newEmailAddresses[i])){
                return true;
            }
        }
        return false;
    }

    const handleSubmit = async() => {
        setIsAdding(true);
        if(textFieldValue.length){
            let splitEmails = textFieldValue.split(" ");
            splitEmails = splitEmails.filter(Boolean);
            const isValid = validateEmailAddresses(splitEmails);
            const hasDuplicate = checkDuplicateEmailAddress(splitEmails, users);
            if(isValid && !hasDuplicate){
                const res: any = await createPermissionHandler(splitEmails);
                const permisisons = res.data;
                const newUsers:any = await fetchUser(splitEmails,permisisons);
                
                const userIds = newUsers.map((user:any) => user._id);
                const userEmails = newUsers.map((user:any) => {
                    return(
                        { 
                            emailAddress: user.emailAddress,
                            _id:user._id,
                            permissionId: user._id,
                            roles: [chosenRole._id]
                        }
                    )
                });
                await updateRoleUsers(chosenRole._id,userIds);
                
                userIds.forEach( async(userId:any) =>{
                    await addUserRoles(userId,chosenRole._id);
                });
                
                setUsers([...users,...userEmails]);
                setTextFieldValue("");
            }
            else if(hasDuplicate){
                setErrorMessage("Email address already exists!");
                setIsError(true);
            }
            else{
                setErrorMessage("Invalid email format.");
                setIsError(true);
            }
        }else{
            setErrorMessage("Provide at least one email address.");
            setIsError(true);
        }
        setIsAdding(false);        
    }
    
    return(
        <Box
            sx={{
                display:'flex',
                height: '10vh',
                maxHeight: '10vh'
            }}

        >

        
        <Box
            sx={{
                display:'flex'
            }}
        >
                <TextField 
                    id="outlined-basic" 
                    label="Email Address" 
                    variant="outlined"
                    value={textFieldValue}
                    onClick={() => {setIsError(false)}} 
                    onChange={handleChange}
                    multiline
                    maxRows={2}
                    style={{width: '500px'}}
                    helperText={isError ? errorMessage: ""}
                    error={isError}
                />
        </Box>
        <Box>
                <Button 
                    type="submit"
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isAdding}
                >
                    {isAdding ? 'Adding...': 'Add'}
                </Button>
        </Box>
        </Box>
    );
}

export default AddUser;